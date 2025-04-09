#!/bin/bash
awslocal s3 mb s3://prod-img-bkt
awslocal sns create-topic --name NewOrderTopic