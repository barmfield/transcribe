import json
import time
import boto3
import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def lambda_handler(event, context):

    job_name = event['body']
    # get request from transcription
    request = get_transcription(job_name)

    logger.debug('===============REQUEST================')
    logger.debug(request)

    return {
        'statusCode': 200,
        'headers':{
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(request)
    }


def get_transcription(job_name):

    s3_client = boto3.client('s3')
    # get transcribed text and parse json
    response = s3_client.get_object(
        Bucket='transcribe-concierge-output',
        Key=job_name+'.json')

    byte_str = response['Body'].read().decode('utf-8')
    parsed = json.loads(byte_str)
    request = parsed['results']['transcripts'][0]['transcript']
    return request
