<!-- <CENTERED SECTION FOR GITHUB DISPLAY> -->

<div align="center">

# 🏛️ omo-olympus

**에이전트에게 이름이 있었습니다. 이제 얼굴도 생겼습니다.**

[![npm](https://img.shields.io/npm/v/omo-olympus?color=369eff&labelColor=black&logo=npm&style=flat-square)](https://www.npmjs.com/package/omo-olympus)
[![License](https://img.shields.io/badge/license-MIT-white?labelColor=black&style=flat-square)](LICENSE)

[English](README.md) | [한국어](README.ko.md)

</div>

<!-- </CENTERED SECTION FOR GITHUB DISPLAY> -->

```
▼ Olympus
 🪨 Sisyphus    Pushing uphill...
 🔍 Explorer    Following a lead...
 📚 Librarian   Cross-referencing...
 🧙 Oracle      💤
 🦉 Metis       💤
 🎭 Momus       💤
 🔥 Prometheus  💤
```

---

[oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent)를 쓰고 있다면, 에이전트가 병렬로 실행되고, 백그라운드 태스크가 날아다니고, 세션이 생겼다 사라지는 걸 알고 있을 겁니다.

근데 그게 **안 보입니다.**

omo-olympus가 바꿔줍니다. 7명의 에이전트. 7개의 그리스 신화 페르소나. 사이드바에서 실시간 대사가 흘러갑니다. Explorer가 코드를 뒤지면 — *"I smell a clue"*. Oracle이 깊이 들여다보면 — *"The vision forms..."*. Momus가 계획을 찢으면 — *"Don't shoot the messenger"*.

비활성 에이전트는 💤. 활성 에이전트는 말합니다. 신들이 일하는 걸 지켜보세요.

## 왜 "Olympus"인가?

하루 종일 터미널을 봅니다. 에이전트는 뒤에서 돌아가고, 최종 결과가 나올 때까지 뭐가 일어나는지 모릅니다.

심심하잖아요.

그래서 각 에이전트에 그리스 신화 이름을 붙이고, 역할에 맞는 성격을 입히고, 매번 바뀌는 대사를 넣었습니다. Sisyphus가 바위를 밀어올리는 동안 Oracle이 안개 너머를 들여다보는 걸 한 번 보고 나면 — 조용한 사이드바로는 돌아가기 어렵습니다.

## 판테온

상태 표시가 아닙니다. 캐릭터입니다.

| | Agent | 역할 | 이런 말을 합니다 |
|:---:|---|---|---|
| 🪨 | **Sisyphus** | 멈추지 않는 자 | *"One more push" · "The boulder rolls again" · "Summit reached ✓"* |
| 🔍 | **Explorer** | 코드베이스 탐정 | *"On the trail!" · "Checking every corner" · "Case closed"* |
| 📚 | **Librarian** | 모든 걸 기억하는 자 | *"To the stacks!" · "Page 394..." · "The records confirm"* |
| 🧙 | **Oracle** | 남들이 못 보는 걸 보는 자 | *"You seek guidance?" · "Patience, mortal..." · "The path is clear"* |
| 🦉 | **Metis** | 누구보다 먼저 생각하는 자 | *"Hmm, interesting..." · "Weighing options..." · "Scope defined"* |
| 🎭 | **Momus** | 잔인할 정도로 솔직한 비평가 | *"Alright, roast time" · "Not convinced yet..." · "The truth hurts"* |
| 🔥 | **Prometheus** | 계획을 벼리는 자 | *"Fire in the forge" · "Connecting the dots..." · "Blueprint ready"* |

에이전트당 4개 상태 — **start**, **working**, **done**, **error** — 각각 랜덤 대사가 돌아갑니다. 매번 다른 느낌.

## 설치

### For Humans

아래 프롬프트를 LLM 에이전트(Claude Code, opencode, Cursor 등)에 붙여넣으세요:

```
Install and configure omo-olympus by following the instructions here:
https://raw.githubusercontent.com/akasai/omo-olympus/refs/heads/main/docs/installation.md
```

진심으로 에이전트한테 시키세요. 설정 머지는 에이전트가 더 잘합니다.

### For LLM Agents

설치 가이드를 가져와서 따라하세요:

```
https://raw.githubusercontent.com/akasai/omo-olympus/refs/heads/main/docs/installation.md
```

### 그냥 직접 하기

설정 파일 두 개. 재시작. 끝.

**`~/.config/opencode/opencode.json`**
```json
{
  "plugin": ["omo-olympus"]
}
```

**`~/.config/opencode/tui.json`**
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["omo-olympus", { "enabled": true }]]
}
```

opencode가 시작할 때 npm 패키지를 자동으로 해석합니다.

## 작동 방식

플러그인 2개. 공유 큐 1개. 설정 0개.

```
task() → 서버가 에이전트 타입 감지 → 대기열 → TUI가 세션 이벤트에서 수신 → 사이드바가 말한다
```

**서버 플러그인**이 `tool.execute.before`를 후킹하고, `task()` 호출을 가로채서, `subagent_type`, `category`, description 키워드로 에이전트를 추론합니다.

**TUI 플러그인**이 `sidebar_content`에 렌더링하고 (사이드바 최상단, order 50), 파일 기반 IPC로 자식 세션을 페르소나에 매핑하고, 리액티브 시그널로 실시간 업데이트합니다.

웹소켓 없음. 공유 메모리 없음. `/tmp`의 JSON 파일 하나와 그걸 통해 대화하는 두 플러그인이 전부입니다.

## 기능

|   | 기능 | 왜 필요한가 |
|:---:|---|---|
| 📂 | **접기/펼치기** | 헤더 클릭으로 토글. 접히면 활성 에이전트 수 표시 |
| 🎨 | **테마 연동** | opencode 테마 색상 자동 반영. RGBA buffer → hex 변환 |
| ⚡ | **실시간** | Solid.js 리액티브 시그널. 에이전트 작업과 동시에 업데이트 |
| 🔇 | **자동 수면** | 완료 3초 후 💤로 복귀 |

## 요구사항

- [opencode](https://opencode.ai) 플러그인 지원 (`@opencode-ai/plugin` >= 1.4.3)
- `task()` 호출 기반 에이전트 오케스트레이션 — e.g., [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent)

## 수동 설치

npm 없이 소스 파일을 직접 복사:

```bash
mkdir -p ~/.config/opencode/plugins
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

로컬 경로로 등록:
```jsonc
// opencode.json
{ "plugin": ["./plugins/omo-olympus-server.ts"] }

// tui.json
{ "plugin": [["./plugins/omo-olympus.tsx", { "enabled": true }]] }
```

## 기여

이슈와 PR 환영합니다. 새로운 페르소나 아이디어, 더 나은 대사, 버그 리포트 — [이슈를 열어주세요](https://github.com/akasai/omo-olympus/issues).

로컬 개발:

```bash
git clone https://github.com/akasai/omo-olympus.git
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

수정하고, opencode 재시작하면 바로 확인 가능합니다.

## 라이선스

MIT
