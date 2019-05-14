import json
import time
import boto3
import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def lambda_handler(event, context):

    # start transcription job
    job_name = transcribe()

    return {
        'statusCode': 200,
        'headers':{
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(job_name)
    }


def transcribe():

    transcribe_client = boto3.client('transcribe')

    # name of file to transcribe which is currently in s3 bucket
    fname = 'test-recording.mp3'

    # name of transcribe output
    job_name = "transcribe_output_" + str(time.time())

    # full string for transcribe job parameters
    job_uri = "https://transcribe-concierge.s3.amazonaws.com/"+ fname

    response = transcribe_client.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={
            'MediaFileUri': job_uri
        },
        OutputBucketName='transcribe-concierge-output',
        MediaFormat='mp3',
        LanguageCode='en-US'
    )
    #
    # # wait for job to finish
    # while True:
    #     status = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
    #     if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
    #         break
    #     print("Not ready yet...")
    #     time.sleep(5)
    # print('==============STATUS===============')
    # print(status)

    return job_name
