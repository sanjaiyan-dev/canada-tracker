import os

from arango.database import StandardDatabase

from notify.notify_client import notify_client
from dotenv import load_dotenv

load_dotenv()

# Show old and new values, see below for example

# Domain: subdomain-example.canada.ca
# Record type: MX
# Org: Org
# Previous value: good-value 0
# Current value: malicious-domain-here 0

# SSC receives only alerts from clients and its partners. This requires new tombstone data that only super admins should be allowed to edit
# Add org acronym in title.
# Add org inside body of email


def send_mx_diff_email_alerts(
    domain,
    record_type,
    org,
    prev_val,
    current_val,
    logger,
):
    """
    Sends an email to the user when the MX records for a domain have changed.

    :param domain: The domain that has changed.
    :param diff_reason: The reason for the change.
    :param logger: The logger object.
    :param db: The database object.
    """

    org_name_en = org["orgDetails"]["en"]["name"]
    org_name_fr = org["orgDetails"]["fr"]["name"]
    org_acronym_en = org["orgDetails"]["en"]["acronym"]
    org_acronym_fr = org["orgDetails"]["fr"]["acronym"]

    stakeholders = os.getenv("ALERT_SUBS").split(",")
    for user in stakeholders:
        try:
            response = notify_client.send_email_notification(
                email_address=user,
                template_id=os.getenv("NOTIFICATION_ASSET_CHANGE_ALERT_EMAIL"),
                personalisation={
                    "domain": domain,
                    "record_type": record_type,
                    "org_name_en": org_name_en,
                    "org_name_fr": org_name_fr,
                    "org_acronym_en": org_acronym_en,
                    "org_acronym_fr": org_acronym_fr,
                    "prev_val": prev_val,
                    "current_val": current_val,
                },
            )
            logger.info(f"Email sent to {user} with response: {response}")
        except Exception as e:
            logger.error(f"Failed to send email to {user} with error: {e}")
