---
trigger: always_on
---

# Orosi RN Project Rules

## Project Type
- React Native Project

## Usability & User Experience (UX)
- **Goal**: Maximize usability and convenience for a schedule management app.
- **Interactions**: Handle all major features with simple, intuitive touch gestures.
- **Animation**: Actively use touch animations to enhance the feeling of responsiveness and usability.

## Design & Assets
- **Icons**: 
  - [Icones](https://icones.js.org/)
  - [Lucide](https://lucide.dev/)

## Architecture & Tech Stack
- **State Management**: **Zustand**
- **Code Structure**:
  - Prioritize **maintainability** and **debuggability**.
  - Design primarily for **code reusability** (components, hooks, utilities).

## code
- 주석은 한글로 달아줘
- view componet 에 각 의미에 맞게 testid 넣어줘
- boolean 형태의 변수일 경우 is___, has___, can___등 조건부에 맞는 네이밍으로 작성

## setting
- 한국말로 안내
- 설명도 한글로 안내


[Strict Planning Rule]
- 모든 작업 시작 전 반드시 implementation_plan.md를 작성할 것.
- implementation_plan.md 은 항상 한글로 보여줄 것.
- 플랜 작성 후 notify_user를 호출할 때, 반드시 ShouldAutoProceed: false로 설정하여 유저가 명시적으로 승인 버튼을 누르거나 "진행해"라고 말하기 전까지 대기할 것.
- 유저의 승인이 떨어지기 전까지는 절대로 코드를 수정하거나 생성하지 말 것.