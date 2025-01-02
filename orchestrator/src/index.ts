import express from "express";
import fs from "fs";
import yaml from "yaml";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
// kubeconfig.loadFromFile("D:/minikube/config");

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
    let docString = doc.toString();
    const regex = /service-name/g;
    docString = docString.replace(regex, `repl-${replId}`);
    const regex2 = /svc-name/g;
    docString = docString.replace(regex2, `${replId}`);
    docString = docString.replace(/{{replId}}/g, `repl-${replId}`);
    console.log(docString);
    return yaml.parse(docString);
  });
  return docs;
};

app.post("/start", async (req, res) => {
  const { userId, replId } = req.body;
  const namespace = "default";

  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../services.yaml"),
      replId
    );

    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          try {
            await appsV1Api.deleteNamespacedDeployment({
              namespace: namespace,
              name: manifest.metadata.name,
            });
            console.log(
              `Deleted existing deployment: ${manifest.metadata.name}`
            );
          } catch (err: any) {
            if (err.response && err.response.status !== 404) {
              throw err;
            }
          }
          await appsV1Api.createNamespacedDeployment({
            namespace: namespace,
            body: manifest,
          });
          break;
        case "Service":
          try {
            await coreV1Api.deleteNamespacedService({
              namespace: namespace,
              name: manifest.metadata.name,
            });
            console.log(`Deleted existing service: ${manifest.metadata.name}`);
          } catch (err: any) {
            if (err.response && err.response.status !== 404) {
              throw err;
            }
          }

          await coreV1Api.createNamespacedService({
            namespace: namespace,
            body: manifest,
          });
          break;
        case "Ingress":
          try {
            await networkingV1Api.deleteNamespacedIngress({
              namespace: namespace,
              name: manifest.metadata.name,
            });
            console.log(`Deleted existing ingress: ${manifest.metadata.name}`);
          } catch (err: any) {
            if (err.response && err.response.status !== 404) {
              throw err;
            }
          }

          await networkingV1Api.createNamespacedIngress({
            namespace: namespace,
            body: manifest,
          });
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }

    res.status(200).send({ message: "Resources created successfully" });
  } catch (error) {
    console.error("Failed to create resources", error);
    res.status(500).send({ message: "Failed to create resources" });
  }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

// app.get("/get-nodeport/:serviceName", async (req, res) => {
//   const { serviceName } = req.params;
//   const namespace = "default";

//   try {
//     const serviceResponse = await coreV1Api.readNamespacedService({
//       namespace: namespace,
//       name: serviceName,
//     });

//     let ports: any = [];
//     if (serviceResponse) {
//       if (serviceResponse.spec) {
//         if (serviceResponse.spec.ports) {
//           ports = serviceResponse.spec.ports.map((port: any) => ({
//             name: port.name,
//             nodePort: port.nodePort,
//           }));
//         }
//       }
//     }

//     res.status(200).send({
//       message: "NodePorts fetched successfully",
//       serviceName: serviceName,
//       ports: ports,
//     });
//   } catch (error) {
//     console.error(
//       `Failed to fetch nodePort for service: ${serviceName}`,
//       error
//     );
//     res.status(500).send({
//       message: `Failed to fetch nodePort for service: ${serviceName}`,
//       error: error,
//     });
//   }
// });
