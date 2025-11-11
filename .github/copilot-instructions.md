# DietMate (근의공식) - AI Coding Assistant Instructions

## Project Overview

React Native app built with Expo Router (SDK 53) for diet/meal planning. Korean language app ("근의공식" = Diet Formula) with multi-platform support (iOS/Android). Uses EAS for builds and OTA updates.

## Architecture & Key Patterns

### State Management Strategy

- **Redux Toolkit** (`shared/store/reduxStore.ts`) for UI state: modals, bottom sheets, carousel controls, user inputs
- **TanStack Query** (`shared/store/reactQueryStore.ts`) for server state: API queries/mutations with optimistic updates
- **AsyncStorage** for persistence: tokens, recent products, user preferences

### Navigation Structure (Expo Router)

```
app/
  _layout.tsx           # Root layout with providers (Redux, QueryClient, BottomSheetModal)
  index.tsx             # Login screen
  (tabs)/               # Tab navigation (Home, Formula)
    _layout.tsx
    index.tsx           # Home screen
    Formula.tsx
  UserInput.tsx         # Onboarding
  Order.tsx, Payment.tsx, etc.
```

### Data Flow Pattern

1. **Query hooks** (`shared/api/queries/*.ts`) fetch/mutate server data
2. **Optimistic updates** in mutations (see `useCreateDietDetail` in `diet.ts`)
3. **Redux slices** (`features/reduxSlices/`) manage derived UI state
4. **Global components** managed via Redux: `GlobalBSM.tsx` for bottom sheets, `ModalComponent.tsx` for modals

### API Layer (`shared/api/`)

- **keys.ts**: React Query keys (`DIET_TOTAL_OBJ`, `PRODUCTS`, etc.)
- **urls.ts**: API endpoint constants
- **requestFn.ts**: Centralized axios wrappers (`queryFn`, `mutationFn`) with token handling
- **queries/**: Custom hooks per domain (diet, order, product, user, etc.)
  - Pattern: `useListDietTotalObj()`, `useCreateDiet()`, `useUpdateDietDetail()`
  - All mutations invalidate related queries automatically

### Bottom Sheet Architecture

- **Single global instance**: `GlobalBSM.tsx` in root layout
- **Redux-controlled**: `bottomSheetSlice.ts` manages queue system for opening/closing
- **Content mapping**: `bsCompByName` object maps sheet names to components
- Usage: `dispatch(openBS({ bsNm: 'summaryInfo' }))` from anywhere

### Styling Approach

- **styled-components/native**: All UI uses styled components
- **Base components**: `shared/ui/styledComps.tsx` exports `Row`, `Col`, `TextMain`, `TextSub`, etc.
- **Font system**: NotoSansKR variants (Light, Regular, Medium, Bold, Black)
- **Colors**: Centralized in `shared/colors.ts` (includes opacity variants)

## Critical Workflows

### Development Environment

```bash
# Start dev server (sets APP_VARIANT)
npm run dev

# Build for testing
eas build --profile development --platform ios
eas build --profile ios-simulator --platform ios

# OTA Updates (no rebuild needed for JS changes)
eas update --environment development --channel development
```

### Environment Variables

- Loaded via `expo-constants` from EAS secrets (see `shared/constants.ts`)
- **Never hardcode**: API keys (Iamport, Kakao), channel keys
- **Exception**: `BASE_URL` hardcoded to avoid rebuild on server changes

### Error Handling

- **Centralized**: `handleError()` in `shared/utils/handleError.ts`
- Converts axios errors to codes (401, 500, 999=server down, null=network offline)
- Error code 999 or null → redirect to `ErrorPage.tsx`
- Other errors → show modal via `openModal({ name: 'requestErrorAlert' })`

### Data Transformation Conventions

- **DTO naming**: `dTOData` = diet total object data, `bLData` = baseline data
- **Regrouping utils**: `shared/utils/dataTransform.ts` for transforming API responses
  - `regroupDDataBySeller()`, `tfDTOToDDA()`, etc.
- **Calculation utils**: `targetCalculation.ts` for BMR/nutrient targets, `sumUp.ts` for aggregations

## Component Patterns

### Screen Components

Located in `components/screens/[domain]/`. Never in `app/` directory.

```tsx
// app/(tabs)/index.tsx imports from:
import CurrentDietCard from "@/components/screens/home/CurrentDietCard";
```

### Reusable UI (`shared/ui/`)

- **DAlert**, **DDropdown**, **DSlider**, **DTextInput**: Custom form components
- **CtaButton**: Primary action button (used throughout)
- **Icon**: Wrapper for vector icons
- Follow existing component patterns - use styled-components, include TypeScript props

### Carousel Management (Formula Screen)

Uses `react-native-reanimated-carousel` with Redux action queue system:

```typescript
// Dispatch from anywhere
dispatch(scrollCarouselTo({ index: 2, from: "onboarding" }));
dispatch(scrollCarouselNext({ from: "userAction" }));

// Carousel component processes queue
dispatch(dequeueCarouselAction());
```

## Code Conventions

### Imports Organization

```tsx
// RN, expo
import { View } from "react-native";
import { useRouter } from "expo-router";

// 3rd party
import styled from "styled-components/native";
import { useQuery } from "@tanstack/react-query";

// doobi (project code)
import colors from "@/shared/colors";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
```

### Path Aliases

- `@/*` resolves to project root (configured in `tsconfig.json`)
- Use imports like: `@/shared/api/queries/diet`, `@/features/reduxSlices/commonSlice`

### Naming Conventions

- **Query hooks**: `useListDietTotalObj`, `useGetBaseLine` (prefix: useList/useGet)
- **Mutation hooks**: `useCreateDiet`, `useUpdateDietDetail`, `useDeleteDietAll` (prefix: useCreate/useUpdate/useDelete)
- **Redux actions**: camelCase (`setCurrentFMCIdx`, `openModal`, `closeBSAll`)
- **Styled components**: PascalCase (`Container`, `TextMain`, `BtnSmall`)

### TypeScript Patterns

- Interfaces prefixed with `I`: `IProductData`, `IDietTotalObjData`, `IMutationOptions`
- Type definitions in `shared/api/types/` by domain
- Redux state types exported from slice files: `IFormulaState`, `BottomSheetState`

## Testing & Debugging

- Check `get_errors` tool output before committing
- Use React Query DevTools (enabled in dev)
- Bottom sheet issues: Check `bottomSheetSlice` action queue
- Network errors: See `handleError.ts` error code mappings

## Key Files Reference

- **Root layout**: `app/_layout.tsx` - providers, navigation config
- **Redux store**: `shared/store/reduxStore.ts` - all slice imports
- **API config**: `shared/api/requestFn.ts`, `shared/constants.ts`
- **Global UI**: `components/bottomSheet/GlobalBSM.tsx`, `components/modal/ModalComponent.tsx`
- **Build config**: `eas.json`, `app.config.ts` (variant handling)
- **Commands**: `cmd.txt` - EAS build/update/submit commands

## Don't

- ❌ Create modal/bottom sheet components without registering in global managers
- ❌ Make API calls directly with axios - use `queryFn`/`mutationFn`
- ❌ Store component state in Redux - use local state or React Query
- ❌ Hardcode colors/dimensions - use `colors.ts` and `constants.ts`
- ❌ Navigate imperatively without router - use `useRouter()` from expo-router
