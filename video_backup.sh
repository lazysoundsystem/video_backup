
#!/bin/bash

# Run the Node.js container with the opt/app volume for configuration.
# Include required environmental variables, run backup.sh and delete backups
# over two weeks old.

docker run -i \
    -v /srv/video_backup.rwlabs.org/opt/app:/opt/app \
    -v /srv/video_backup.rwlabs.org/opt/data:/opt/data \
    --rm \
    --name rwint-video-backup \
    unocha/nodejs \
    sh -c "\
        . /opt/app/env.sh && \
        cd /opt/app && \
        /opt/app/backup.js && \
        cd /opt/data && \
        find ./ -type f -mtime +14 -delete "
