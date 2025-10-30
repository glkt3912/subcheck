# Tasks: SubCheck Subscription Diagnostic Service

**Input**: Design documents from `/specs/001-subcheck-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test requirements in specification - focusing on implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install and configure Vitest testing framework with React Testing Library per research.md
- [X] T002 [P] Install Recharts for pie chart visualization per research.md
- [X] T003 [P] Configure TypeScript types directory structure at types/
- [X] T004 [P] Create static subscription master data file at lib/data/subscriptions.ts
- [X] T005 [P] Setup calculation constants file at lib/calculations/constants.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create core TypeScript interfaces in types/subscription.ts
- [X] T007 [P] Create TypeScript interfaces in types/diagnosis.ts
- [X] T008 [P] Export all types from types/index.ts
- [X] T009 Implement LocalStorage service in lib/storage/StorageService.ts
- [X] T010 [P] Implement subscription service in lib/services/SubscriptionService.ts
- [X] T011 [P] Implement calculation service in lib/calculations/CalculationService.ts
- [X] T012 Create base UI components directory structure at components/ui/
- [X] T013 [P] Create shared layout component in app/layout.tsx
- [X] T014 [P] Configure Tailwind CSS globals in app/globals.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Subscription Analysis (Priority: P1) 🎯 MVP

**Goal**: Users can select subscriptions, input usage frequency, and see waste calculation results

**Independent Test**: User navigates from landing page → subscription selection → usage input → results display with calculated waste percentage and yearly amounts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create landing page component at app/page.tsx
- [ ] T016 [P] [US1] Create subscription selection page at app/diagnosis/select/page.tsx
- [ ] T017 [P] [US1] Create usage frequency input page at app/diagnosis/usage/page.tsx
- [ ] T018 [P] [US1] Create results display page at app/diagnosis/results/page.tsx
- [ ] T019 [P] [US1] Create subscription selector component at components/forms/SubscriptionSelector.tsx
- [ ] T020 [P] [US1] Create usage frequency selector component at components/forms/UsageFrequencySelector.tsx
- [ ] T021 [P] [US1] Create results chart component at components/charts/WasteChart.tsx
- [ ] T022 [P] [US1] Create results summary component at components/shared/ResultsSummary.tsx
- [ ] T023 [US1] Implement diagnosis session management hook at lib/hooks/useDiagnosisSession.ts
- [ ] T024 [US1] Implement diagnosis service in lib/services/DiagnosisService.ts
- [ ] T025 [US1] Connect landing page to start diagnosis flow
- [ ] T026 [US1] Connect subscription selection to session state
- [ ] T027 [US1] Connect usage input to calculation service
- [ ] T028 [US1] Connect results display to chart visualization
- [ ] T029 [US1] Add navigation between diagnosis steps
- [ ] T030 [US1] Add data persistence using LocalStorage

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Social Sharing (Priority: P2)

**Goal**: Users can share their diagnosis results on Twitter/X and LINE

**Independent Test**: From results page, user can click Twitter and LINE share buttons to open pre-filled sharing interfaces

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create sharing service in lib/services/SharingService.ts
- [ ] T032 [P] [US2] Create social share buttons component at components/shared/SocialShareButtons.tsx
- [ ] T033 [P] [US2] Create share text formatter utility in lib/utils/shareTextFormatter.ts
- [ ] T034 [US2] Integrate sharing buttons into results page component
- [ ] T035 [US2] Implement Twitter share URL generation
- [ ] T036 [US2] Implement LINE share URL generation
- [ ] T037 [US2] Add native share API fallback for mobile devices
- [ ] T038 [US2] Test social sharing integration

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Custom Subscription Addition (Priority: P3)

**Goal**: Users can add custom subscription services not in the predefined list

**Independent Test**: User can click "Add Custom Service" button, fill in service name and monthly price, and include it in their diagnosis

### Implementation for User Story 3

- [ ] T039 [P] [US3] Create custom subscription form component at components/forms/CustomSubscriptionForm.tsx
- [ ] T040 [P] [US3] Create custom subscription manager component at components/forms/CustomSubscriptionManager.tsx
- [ ] T041 [P] [US3] Add validation utilities for custom subscription input in lib/utils/validation.ts
- [ ] T042 [US3] Extend subscription service to handle custom subscriptions
- [ ] T043 [US3] Integrate custom subscription form into selection page
- [ ] T044 [US3] Add custom subscription persistence to LocalStorage
- [ ] T045 [US3] Add custom subscription removal functionality
- [ ] T046 [US3] Add validation for custom subscription data (price limits, name length)
- [ ] T047 [US3] Test custom subscription flow end-to-end

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Add responsive design improvements for mobile devices
- [ ] T049 [P] Add loading states for all async operations
- [ ] T050 [P] Add error handling and user feedback for LocalStorage failures
- [ ] T051 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T052 [P] Optimize bundle size and performance
- [ ] T053 [P] Add data cleanup utilities for old LocalStorage data
- [ ] T054 [P] Add browser compatibility fallbacks
- [ ] T055 [P] Add Japanese text validation and proper number formatting
- [ ] T056 Validate quickstart.md development workflow
- [ ] T057 Performance testing for SC-001 (3 minute completion) and SC-002 (2 second results)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 results but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 selection but independently testable

### Within Each User Story

- Page components before integration
- Service layer before UI integration
- Core functionality before navigation
- Data persistence after core functionality

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Page components within a story marked [P] can run in parallel
- Service components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all page components for User Story 1 together:
Task: "Create landing page component at app/page.tsx"
Task: "Create subscription selection page at app/diagnosis/select/page.tsx"
Task: "Create usage frequency input page at app/diagnosis/usage/page.tsx"
Task: "Create results display page at app/diagnosis/results/page.tsx"

# Launch all form components for User Story 1 together:
Task: "Create subscription selector component at components/forms/SubscriptionSelector.tsx"
Task: "Create usage frequency selector component at components/forms/UsageFrequencySelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2  
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 57
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 9 tasks (blocking)
- **User Story 1 (P1)**: 16 tasks - Core diagnostic functionality
- **User Story 2 (P2)**: 8 tasks - Social sharing features
- **User Story 3 (P3)**: 9 tasks - Custom subscription management
- **Polish Phase**: 10 tasks - Cross-cutting improvements

### Parallel Opportunities Identified

- **25 tasks** marked with [P] can run in parallel within their phase
- **User Stories** can run in parallel after foundational phase
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 30 tasks

### Independent Test Criteria

- **User Story 1**: Complete diagnosis flow from start to results
- **User Story 2**: Share functionality from results page
- **User Story 3**: Custom subscription addition and usage in diagnosis

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Focus on mobile-first responsive design throughout implementation
- Maintain Japanese language support and number formatting
- LocalStorage-first approach with graceful fallbacks for storage issues