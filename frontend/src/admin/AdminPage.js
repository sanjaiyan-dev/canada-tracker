import React, { useCallback, useState, useEffect } from 'react'
import { Button, Flex, Stack, Text, useToast, Select } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { t, Trans } from '@lingui/macro'
import { useQuery } from '@apollo/client'
import { Link as RouteLink, useHistory, useParams } from 'react-router-dom'
import { useLingui } from '@lingui/react'

import { AdminPanel } from './AdminPanel'
import { OrganizationInformation } from './OrganizationInformation'

import { ADMIN_PAGE } from '../graphql/queries'
import { Dropdown } from '../components/Dropdown'
import { ErrorFallbackMessage } from '../components/ErrorFallbackMessage'
import { useDebouncedFunction } from '../utilities/useDebouncedFunction'
import { bool } from 'prop-types'
import { SuperAdminUserList } from './SuperAdminUserList'
import { AuditLogTable } from './AuditLogTable'
import { ErrorBoundary } from 'react-error-boundary'

export default function AdminPage({ isLoginRequired }) {
  const [selectedOrg, setSelectedOrg] = useState('none')
  const [orgDetails, setOrgDetails] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [initRender, setInitRender] = useState(true)

  const { activeMenu } = useParams()
  const toast = useToast()
  const history = useHistory()
  const { i18n } = useLingui()

  const memoizedSetDebouncedSearchTermCallback = useCallback(() => {
    setDebouncedSearchTerm(searchTerm)
  }, [searchTerm])

  useDebouncedFunction(memoizedSetDebouncedSearchTermCallback, 500)

  const { loading, error, data } = useQuery(ADMIN_PAGE, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    variables: {
      first: 100,
      orderBy: { field: 'NAME', direction: 'ASC' },
      isAdmin: true,
      includeSuperAdminOrg: true,
      search: debouncedSearchTerm,
    },
    onError: (error) => {
      const [_, message] = error.message.split(': ')
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-left',
      })
    },
  })

  useEffect(() => {
    if (!activeMenu) {
      history.replace(`/admin/organizations`)
    }
    if (initRender && data?.findMyOrganizations?.edges.length === 1) {
      setInitRender(false)
      setOrgDetails({
        slug: data?.findMyOrganizations?.edges[0]?.node?.slug,
        id: data?.findMyOrganizations?.edges[0]?.node?.id,
      })
      setSelectedOrg(data?.findMyOrganizations?.edges[0]?.node?.name || 'none')
    }
  }, [activeMenu, history, data])

  if (error) {
    return <ErrorFallbackMessage error={error} />
  }

  let dropdown
  let options = []

  if (loading) {
    dropdown = (
      <Dropdown
        label={i18n._(t`Organization: `)}
        labelDirection="row"
        options={[]}
        placeholder={i18n._(t`Select an organization`)}
        onSearch={(val) => setSearchTerm(val)}
        searchValue={searchTerm}
      />
    )
  } else {
    options = []
    data.findMyOrganizations?.edges.forEach((edge) => {
      const { slug, name, id } = edge.node
      options.push({ label: name, value: { slug: slug, id: id } })
    })
    dropdown = (
      <Dropdown
        label={i18n._(t`Organization: `)}
        labelDirection="row"
        options={options}
        placeholder={i18n._(t`Select an organization`)}
        onSearch={(val) => setSearchTerm(val)}
        searchValue={searchTerm}
        onChange={(opt) => {
          setOrgDetails(opt.value)
          setSelectedOrg(opt.label)
        }}
        mr="auto"
      />
    )
  }

  const changeActiveMenu = (val) => {
    if (activeMenu !== val) {
      history.replace(`/admin/${val}`)
    }
  }

  const orgPanel = (
    <>
      <Flex direction={{ base: 'column', md: 'row' }} align="center" justifyContent="space-between">
        {dropdown}
        <Button
          variant="primary"
          ml={{ base: '0', md: 'auto' }}
          w={{ base: '100%', md: 'auto' }}
          mt={{ base: 2, md: 0 }}
          as={RouteLink}
          to="/create-organization"
        >
          <AddIcon mr={2} aria-hidden="true" />
          <Trans>Create Organization</Trans>
        </Button>
      </Flex>
      {selectedOrg !== 'none' ? (
        <>
          <OrganizationInformation
            orgSlug={orgDetails.slug}
            mb="1rem"
            removeOrgCallback={setSelectedOrg}
            // set key, this resets state when switching orgs (closes editing box)
            key={orgDetails.slug}
            isLoginRequired={isLoginRequired}
            isUserSuperAdmin={data?.isUserSuperAdmin}
          />
          <AdminPanel
            activeMenu={activeMenu}
            orgSlug={orgDetails.slug}
            orgId={orgDetails.id}
            permission={data?.isUserSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'}
            mr="4"
          />
        </>
      ) : (
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          <Trans>Select an organization to view admin options</Trans>
        </Text>
      )}
    </>
  )

  let adminPanel
  if (activeMenu === 'users' && data?.isUserSuperAdmin) {
    adminPanel = <SuperAdminUserList permission={data?.isUserSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'} />
  } else if (activeMenu === 'audit-logs' && data?.isUserSuperAdmin) {
    adminPanel = (
      <ErrorBoundary FallbackComponent={ErrorFallbackMessage}>
        <AuditLogTable />
      </ErrorBoundary>
    )
  } else {
    adminPanel = orgPanel
  }

  return (
    <Stack spacing={10} w="100%" px={4}>
      {data?.isUserSuperAdmin && (
        <label>
          <Flex align="center">
            <Text fontSize="lg" fontWeight="bold" mr="2">
              <Trans>Super Admin Menu:</Trans>
            </Text>
            <Select w="20%" defaultValue={activeMenu} onChange={(e) => changeActiveMenu(e.target.value)}>
              <option value="organizations">{t`Organizations`}</option>
              <option value="users">{t`Users`}</option>
              <option value="audit-logs">{t`Audit Logs`}</option>
            </Select>
          </Flex>
        </label>
      )}
      {adminPanel}
    </Stack>
  )
}

AdminPage.propTypes = {
  isLoginRequired: bool,
}
