import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

// TODO: Implement the fileStogare logic
export const createUploadUrl = (attachmentUrl: string, bucketName: string): string => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentUrl,
    Expires: urlExpiration
  })
}
