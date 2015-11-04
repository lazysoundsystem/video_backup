
#!/bin/bash

# Run the Node.js container with the opt/app volume for configuration.
# Include required environmental variables, and run backup.sh.

docker run -i \
    -v /srv/video_backup.rwlabs.org/opt/app:/opt/app \
    -v /srv/video_backup.rwlabs.org/opt/data:/opt/data \
    --rm \
    --name rwint-video-backup \
    unocha/nodejs \
    sh -c "\
        . /opt/app/env.sh && \
        cd /opt/app && \
        /opt/app/backup.js"
