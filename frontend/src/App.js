import React, { Suspense, lazy } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useLingui } from '@lingui/react'
import { Global, css } from '@emotion/core'
import { LandingPage } from './LandingPage'
import { Main } from './Main'
import { Trans } from '@lingui/macro'
import { TopBanner } from './TopBanner'
import { PhaseBanner } from './PhaseBanner'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { Flex, Link, CSSReset } from '@chakra-ui/core'
import { SkipLink } from './SkipLink'
import { TwoFactorNotificationBar } from './TwoFactorNotificationBar'
import { useUserState } from './UserState'
import { RouteIf } from './RouteIf'

const PageNotFound = lazy(() => import('./PageNotFound'))
const DomainsPage = lazy(() => import('./DomainsPage'))
const CreateUserPage = lazy(() => import('./CreateUserPage'))
const QRcodePage = lazy(() => './QRcodePage')
const UserPage = lazy(() => import('./UserPage'))
const UserList = lazy(() => import('./UserList'))
const SignInPage = lazy(() => import('./SignInPage'))

export default function App() {
  // Hooks to be used with this functional component
  const { i18n } = useLingui()
  const { currentUser, isLoggedIn } = useUserState()

  return (
    <>
      <Flex direction="column" minHeight="100vh" bg="gray.50">
        <header>
          <CSSReset />
          <Global
            styles={css`
              @import url('https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i&display=swap');
            `}
          />
          <SkipLink invisible href="#main">
            <Trans>Skip to main content</Trans>
          </SkipLink>
          <PhaseBanner phase={<Trans>Pre-Alpha</Trans>}>
            <Trans>This service is being developed in the open</Trans>
          </PhaseBanner>
          <TopBanner />
        </header>
        <Navigation>
          <Link to="/">
            <Trans>Home</Trans>
          </Link>
          <Link to="/domains">
            <Trans>Domains</Trans>
          </Link>

          {isLoggedIn() ? (
            <Link to="/user">
              <Trans>User Profile</Trans>
            </Link>
          ) : (
            <Link to="/sign-in">
              <Trans>Sign In</Trans>
            </Link>
          )}
          <Link to="/user-list">
            <Trans>User List</Trans>
          </Link>
        </Navigation>
        {isLoggedIn() && !currentUser.tfa && <TwoFactorNotificationBar />}
        <Main>
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route exact path="/">
                <LandingPage />
              </Route>

              <Route path="/domains">
                <DomainsPage />
              </Route>

              <RouteIf
                condition={isLoggedIn()}
                consequent="/user"
                alternate="/sign-in"
              >
                <UserPage userName={currentUser.userName} />
              </RouteIf>

              <Route path="/sign-in" component={SignInPage} />

              <Route path="/create-user">
                <CreateUserPage />
              </Route>

              <RouteIf
                condition={isLoggedIn()}
                consequent="/two-factor-code"
                alternate="/sign-in"
              >
                <QRcodePage userName={currentUser.userName} />
              </RouteIf>

              <RouteIf
                condition={isLoggedIn()}
                consequent="/user-list"
                alternate="/sign-in"
              >
                <UserList />
              </RouteIf>

              <Route component={PageNotFound} />
            </Switch>
          </Suspense>
        </Main>
        <Footer>
          <Link
            href={
              i18n.locale === 'en'
                ? 'https://www.canada.ca/en/transparency/privacy.html'
                : 'https://www.canada.ca/fr/transparence/confidentialite.html'
            }
          >
            <Trans>Privacy</Trans>
          </Link>
          <Link
            ml={4}
            href={
              i18n.locale === 'en'
                ? 'https://www.canada.ca/en/transparency/terms.html'
                : 'https://www.canada.ca/fr/transparence/avis.html'
            }
          >
            <Trans>Terms & conditions</Trans>
          </Link>
        </Footer>
      </Flex>
    </>
  )
}
