/**
 * =======================================================================
 *  UNIVERSAL BASE REPOSITORY CONTRACTS (cuur-CDE Core)
 *  -----------------------------------------------------------------------
 *  DO NOT EDIT MANUALLY — domain repositories depend on these interfaces.
 *
 *  Responsibilities:
 *    ✓ Multi-tenant scoping (orgId required everywhere)
 *    ✓ Cursor-based pagination standard
 *    ✓ Separation of Read-Only vs CRUD vs Action repos
 *    ✓ Fully OpenAPI-aligned repository method signatures
 *
 *  CRITICAL RULE: Never add methods to base interfaces (ReadRepository,
 *  CrudRepository) without regenerating all 88 dependent repositories.
 *  Use marker interfaces below for safe extension instead.
 * =======================================================================
 */
export {};
//# sourceMappingURL=_base-repository.js.map