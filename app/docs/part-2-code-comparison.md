# Part 2: Code Comparison - Backend Baseline vs V&V Update

## 1. Branches compared

| Purpose | Branch / commit |
|---|---|
| Original Backend baseline | `pornpimol/backend-original` from `backend-original/develop` at `a0dac61` |
| V&V-improved Election App | `pornpimol/part-2-election-unit-tests` |

The original repository remains unchanged. The baseline branch is retained only as
evidence for the comparison.

## 2. What remains the same

- Both systems are TypeScript backends using Express.
- Both provide authentication-related routes such as registration and login.
- Both use role-based access control for election-system users.
- Both contain election-domain concepts: users, roles, districts or constituencies,
  and voting-related operations.

## 3. What changed in the V&V-improved code

| Area | Original Backend | V&V-improved Election App | Rationale |
|---|---|---|---|
| Route dependencies | `AuthRoutes.ts` imports service modules and middleware directly | `accountRoutes.ts` receives `AccountService` and `TokenService` as dependencies | Dependencies can be replaced in tests without starting Express or a database |
| Error handling | Several handlers contain local `try/catch` blocks and directly return HTTP errors | `DomainError` subclasses and one central Express error handler provide consistent responses | Reduces duplicated route code and makes expected failure paths testable |
| Authentication and roles | Supports multiple roles and chooses a current role during login | Uses explicit `VOTER`, `COMMISSIONER`, and `ADMIN` roles for the workshop scope | Keeps test data and authorization assertions focused and deterministic |
| Election-status logic | No independently testable unit for district-level open/close status was identified in the inspected baseline route | Adds `ElectionStatusService` with `OPEN` and `CLOSED` states | Moves state-transition rules into a small unit that can be tested in isolation |
| External dependencies | Route logic is coupled to imported services and middleware | `ElectionStatusService` receives repositories and a clock through constructor injection | Enables Stub, Spy, Mock, and deterministic time in Unit Tests |
| Test data | No baseline test-data strategy was used in this comparison | Uses fixed test fixtures plus seeded Faker-generated district data | Allows dynamic data while keeping test runs reproducible |

## 4. V&V evidence

`ElectionStatusService` is covered by 11 Unit Tests:

- TC-ECT-F03-07: open one closed district
- TC-ECT-F03-08: close one open district
- Alternative path: reject an unknown district
- TC-ECT-F03-09 to TC-ECT-F03-11: open all, cancel, and idempotent repeat
- TC-ECT-F03-12 to TC-ECT-F03-14: close all, cancel, and idempotent repeat
- TC-ECT-F03-15 and TC-ECT-F03-16: permit voting only when district status is open
- Faker-generated district data
- Stub, Spy, and Jest Mock repository examples

Final unit-test result: 8 suites and 42 tests passed.

## 5. Scope and limitation

The original Backend and the workshop Election App are different projects, so this is
an architectural comparison rather than a line-by-line migration. The V&V branch
does not claim to reproduce every original endpoint.

`ElectionStatusService` is deliberately an isolated domain unit for this assignment.
Connecting it to a PostgreSQL repository and HTTP routes is a future integration task;
the current evidence demonstrates the requested Unit Test design and implementation.