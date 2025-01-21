import fs from "fs";
import yaml from "yaml";

export const readAndParseKubeYaml = (
  filePath: string,
  replId: string
): Array<any> => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
    let docString = doc.toString();
    const regex = /service-name/g;
    docString = docString.replace(regex, `repl-${replId}`);
    const regex2 = /svc-name/g;
    docString = docString.replace(regex2, `${replId}`);
    docString = docString.replace(/{{replId}}/g, `repl-${replId}`);
    // console.log(docString);
    return yaml.parse(docString);
  });
  return docs;
};
