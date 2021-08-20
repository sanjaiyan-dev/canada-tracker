import { array, number, object, ref, string } from 'yup'
import { t } from '@lingui/macro'
import { i18n } from '@lingui/core'
import {
  array as arrayProp,
  object as objectProp,
  string as stringProp,
} from 'prop-types'

const getSchema = () => {
  return {
    email: string()
      .required(i18n._(t`Email cannot be empty`))
      .email(i18n._(t`Invalid email`)),
    confirmEmail: string()
      .required(i18n._(t`Email cannot be empty`))
      .oneOf([ref('userName')], t`User email does not match`),
    displayName: string().required(i18n._(t`Display name cannot be empty`)),
    password: string()
      .required(i18n._(t`Password cannot be empty`))
      .min(12, i18n._(t`Password must be at least 12 characters long`)),
    passwordSignIn: string().required(i18n._(t`Password cannot be empty`)),
    confirmPassword: string()
      .required(i18n._(t`Password confirmation cannot be empty`))
      .oneOf([ref('password')], t`Passwords must match`),
    currentPassword: string().required(
      i18n._(t`Please enter your current password.`),
    ),
    lang: string()
      .required(i18n._(t`Please choose your preferred language`))
      .oneOf(['ENGLISH', 'FRENCH'], ''),
    twoFactorCode: number()
      .typeError(i18n._(t`Verification code must only contains numbers`))
      .required(i18n._(t`Code field must not be empty`)),
    domainUrl: string().required(i18n._(t`Domain url field must not be empty`)),
    phoneNumber: string()
      .required(i18n._(t`Phone number field must not be empty`))
      .matches(
        /^[1-9]\d{9,14}$/,
        i18n._(
          t`Phone number must be a valid phone number that is 10-15 digits long`,
        ),
      ),
    acronym: string()
      .matches(
        /^[A-Z]+(?:_[A-Z]+)*$/gm,
        i18n._(t`Acronyms can only use upper case letters and underscores`),
      )
      .max(50, i18n._(t`Acronyms must be at most 50 characters`)),
    field: string().required(i18n._(t`This field cannot be empty`)),
    selectors: array().of(
      string()
        .required(i18n._(t`Selector cannot be empty`))
        .matches(
          /^([\S]+)([.]_domainkey)$/gm,
          i18n._(t`Selector must be string ending in '._domainkey'`),
        ),
    ),
  }
}

const filterSchema = (keyArray) => {
  const schema = getSchema()

  return keyArray.reduce((selectedSchema, currentKey) => {
    selectedSchema[currentKey] = schema[currentKey]
    return selectedSchema
  }, {})
}

export const getRequirment = (key) => {
  return getSchema()[key]
}

export const schemaToValidation = (schema) => {
  return object().shape(schema)
}

export const createValidationSchema = (keyArray) => {
  return schemaToValidation(filterSchema(keyArray))
}

getRequirment.propTypes = {
  keyArray: stringProp.isRequired,
}

schemaToValidation.propTypes = {
  schema: objectProp.isRequired,
}

createValidationSchema.propTypes = {
  keyArray: arrayProp.isRequired,
}
