# Changelog


## 1.0.0-beta.17

### feature/http-urls

- Adjust HTTP URLs.


## 1.0.0-beta.16

### bugfix/load-assignments

- Load assignments without filtering by contextId (required for caching).


## 1.0.0-beta.15

### feature/encapsulate-axios

- Accept HTTP client config instead of the client.


## 1.0.0-beta.14

### feature/flbt

- Merge check, clean and build scripts.
- Replace pipe by flbt scripts.

### feature/eslint

- Setup ESLint.
- Fix lint errors and warnings.

### feature/prettier

- Setup prettier.
- Format sources.

### feature/improvements

- Add RbacItemTypeEnum and RbacItemType.
- Add manager's return types & fix uncovered issues.
- Inherit error classes from RbacError.
- Rename RbacContextId.


## 1.0.0-beta.13

### feature/context-id

- Add support for assignments context.


## 1.0.0-beta.12

### feature/compose-env

- Allow to customize ports.


## 1.0.0-beta.11

- Migrate library to TS.
- Upgrade dependencies.
- Add docker compose to support local runs.


## 1.0.0-beta.10

- Update http adapter to support secure cookies.
- Upgrade lerna.
- Upgrade yarn.


## 1.0.0-beta.9

- Fix postgres adapter.
- Update knex.


## 1.0.0-beta.8

- Add postgres adapter.