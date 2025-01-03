import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { readAndParseKubeYaml } from "../utils/helpers.ts";
import Repl from "../models/repl.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const handleResourceRequest = asyncHandler(async (req: any, res: any) => {
  try {
    const { userId, replId } = req.body;

    if (!userId || !replId) {
      return res.status(400).json({ message: "userId and replId is required" });
    }

    const project = await Repl.findOne({ _id: replId, owner: userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const namespace = "default";
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../../services.yaml"),
      replId
    );

    if (!kubeManifests) {
      return res.status(500).json({ message: "Something went wrong!" });
    }

    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          try {
            await appsV1Api.readNamespacedDeployment({
              name: manifest.metadata.name,
              namespace: namespace,
            });

            console.log(`Deployment already exists: ${manifest.metadata.name}`);
          } catch (err: any) {
            if (err.code === 404) {
              await appsV1Api.createNamespacedDeployment({
                namespace: namespace,
                body: manifest,
              });
              console.log(`Created new deployment: ${manifest.metadata.name}`);
            } else {
              throw err;
            }
          }
          break;
        case "Service":
          try {
            await coreV1Api.readNamespacedService({
              name: manifest.metadata.name,
              namespace: namespace,
            });
            console.log(`Service already exists: ${manifest.metadata.name}`);
          } catch (err: any) {
            if (err.code === 404) {
              await coreV1Api.createNamespacedService({
                namespace: namespace,
                body: manifest,
              });
              console.log(`Created new service: ${manifest.metadata.name}`);
            } else {
              throw err;
            }
          }
          break;
        case "Ingress":
          try {
            await networkingV1Api.readNamespacedIngress({
              name: manifest.metadata.name,
              namespace: namespace,
            });
            console.log(`Ingress already exists: ${manifest.metadata.name}`);
          } catch (err: any) {
            if (err.code === 404) {
              await networkingV1Api.createNamespacedIngress({
                namespace: namespace,
                body: manifest,
              });
              console.log(`Created new ingress: ${manifest.metadata.name}`);
            } else {
              throw err;
            }
          }
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }

    return res
      .status(200)
      .json({ message: "Resources processed successfully" });
  } catch (error) {
    console.error("Failed to create resources", error);
    res.status(500).json({ message: "Failed to create resources" });
  }
});

export { handleResourceRequest };
