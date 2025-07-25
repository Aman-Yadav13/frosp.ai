import pkg from "aws-sdk";
const { S3 } = pkg;

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

export async function copyS3Folder(
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: sourcePrefix,
      ContinuationToken: continuationToken,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    // Copy each object to the new location
    // We're doing it parallely here, using promise.all()
    await Promise.all(
      listedObjects.Contents.map(async (object) => {
        if (!object.Key) return;
        let destinationKey = object.Key.replace(
          sourcePrefix,
          destinationPrefix
        );
        let copyParams = {
          Bucket: process.env.S3_BUCKET ?? "",
          CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
          Key: destinationKey,
        };

        console.log(copyParams);

        await s3.copyObject(copyParams).promise();
        console.log(`Copied ${object.Key} to ${destinationKey}`);
      })
    );

    // Check if the list was truncated and continue copying if necessary
    if (listedObjects.IsTruncated) {
      listParams.ContinuationToken = listedObjects.NextContinuationToken;
      await copyS3Folder(sourcePrefix, destinationPrefix, continuationToken);
    }
  } catch (error) {
    console.error("Error copying folder:", error);
  }
}

export async function deleteS3Folder(
  prefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: prefix,
      ContinuationToken: continuationToken,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    await Promise.all(
      listedObjects.Contents.map(async (object) => {
        if (!object.Key) return;
        const deleteParams = {
          Bucket: process.env.S3_BUCKET ?? "",
          Key: object.Key,
        };

        console.log(deleteParams);

        await s3.deleteObject(deleteParams).promise();
        console.log(`Deleted ${object.Key}`);
      })
    );

    if (listedObjects.IsTruncated) {
      listParams.ContinuationToken = listedObjects.NextContinuationToken;
      await deleteS3Folder(prefix, listParams.ContinuationToken);
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
}

export const saveToS3 = async (
  key: string,
  filePath: string,
  content: string
): Promise<void> => {
  const params = {
    Bucket: process.env.S3_BUCKET ?? "",
    Key: `${key}${filePath}`,
    Body: content,
  };

  await s3.putObject(params).promise();
};
