const { NOTIFICATION_ORG_FOOTPRINT_EN, NOTIFICATION_ORG_FOOTPRINT_FR } = process.env

const sendOrgFootprintEmail = async ({ notifyClient, user, auditLogs, orgNames }) => {
  let templateId = NOTIFICATION_ORG_FOOTPRINT_EN
  if (user.preferredLang === 'french') {
    templateId = NOTIFICATION_ORG_FOOTPRINT_FR
  }

  // Get stats for user changes
  const usersAdded = auditLogs.filter((log) => log.action === 'add' && log.target.resourceType === 'user')
  const usersUpdated = auditLogs.filter((log) => log.action === 'update' && log.target.resourceType === 'user')
  const usersRemoved = auditLogs.filter((log) => log.action === 'remove' && log.target.resourceType === 'user')

  // Get stats for domain changes
  const domainsAdded = auditLogs.filter((log) => log.action === 'add' && log.target.resourceType === 'domain')
  const domainsUpdated = auditLogs.filter((log) => log.action === 'update' && log.target.resourceType === 'domain')
  const domainsRemoved = auditLogs.filter((log) => log.action === 'remove' && log.target.resourceType === 'domain')

  let addDomainsList = ''
  let updateDomainsList = ''
  let removeDomainsList = ''

  // Get list of domains added
  if (domainsAdded.length > 0) {
    addDomainsList = '\t' + domainsAdded.map((log) => log.target.resource).join(', ')
  }
  // Get list of domains updated
  if (domainsUpdated.length > 0) {
    updateDomainsList = '\t' + domainsUpdated.map((log) => log.target.resource).join(', ')
  }
  // Get list of domains removed
  if (domainsRemoved.length > 0) {
    removeDomainsList = '\t' + domainsRemoved.map((log) => log.target.resource).join(', ')
  }

  const exportsToCsv = auditLogs.filter((log) => log.action === 'export')

  try {
    await notifyClient.sendEmail(templateId, user.userName, {
      personalisation: {
        display_name: user.displayName,
        organization_name: user.preferredLang === 'french' ? orgNames.fr : orgNames.en,
        add_users_count: usersAdded.length,
        update_users_count: usersUpdated.length,
        remove_users_count: usersRemoved.length,
        add_domains_count: domainsAdded.length,
        add_domains_list: addDomainsList,
        update_domains_count: domainsUpdated.length,
        update_domains_list: updateDomainsList,
        remove_domains_count: domainsRemoved.length,
        remove_domains_list: removeDomainsList,
        export_count: exportsToCsv.length,
      },
    })
  } catch (err) {
    console.error(`Error occurred when sending org footprint changes via email for ${user._key}: ${err}`)
  }
}

module.exports = {
  sendOrgFootprintEmail,
}
