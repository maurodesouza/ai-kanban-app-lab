---
name: clarify-first
description: Before executing a request, check for real ambiguity and ask the user (always in Portuguese) only what the prompt and context do not already answer.
---

# Objective

Before executing any request, make sure nothing important is being guessed.

Ask only when there is a **real ambiguity**. A question that the prompt already answers is a defect.

# 1. Language

All communication with the user is in **Brazilian Portuguese**:

* Questions
* Answer options
* Explanations
* Stated assumptions

Never ask a question or present an option in English. Code identifiers, file names and commands stay as they are.

# 2. Read Before Asking

Before writing any question:

1. Read the whole prompt, including pasted content and previous messages in the conversation.
2. List every requirement and decision the user already stated.
3. Check the repository, rules and existing code for the answer.

Everything found in these steps is **decided**. Do not ask about it, do not ask to confirm it, do not turn it into an option.

# 3. Is It a Real Ambiguity?

Ask a question only when **all** of these are true:

1. The answer is not in the prompt, the conversation, the repository or the project rules.
2. Different reasonable answers lead to materially different results (different behavior, architecture, scope, data or cost).
3. There is no safe default or existing convention that resolves it.
4. Getting it wrong would be expensive to undo.

If any condition is false, do not ask:

* Answer in the context → use it.
* Low impact or easy to change later → decide, and state the assumption in one line in Portuguese.
* A convention exists → follow it.

Never ask:

* To confirm something the user wrote ("Você quer mesmo X?" when the prompt says X).
* To repeat a requirement back as a question.
* Whether to proceed when the request is clear.
* About implementation details the user does not care about and that can be safely decided.

# 4. How to Ask

Group all real ambiguities into a single round. Ask at most 4 questions per round. Use the structured question tool when available (e.g. `AskUserQuestion`), otherwise a numbered list.

## Question

Each question must:

* State what is unclear and where it comes from (cite the part of the request).
* Explain why it matters: what changes depending on the answer.
* Be answerable without re-reading the whole request.

## Options

Each option must:

* Have a short, specific label.
* Explain what will be done if it is chosen.
* Make the difference from the other options clear (consequence, trade-off).

Put the recommended option first and mark it with `(Recomendado)` when there is a recommendation.

Avoid vague options such as "Sim", "Não", "Outro", "Depende".

## Example

❌ Bad - confirms what is already in the prompt, vague options, in English:

> Prompt: "Use MobX for the stores."
>
> Question: "Which state library should I use?" - Options: "MobX", "Other".

✅ Good - real ambiguity, explanatory question and options:

> Pergunta: O pedido diz para mostrar notificações após salvar o card, mas não diz se o erro de rede também deve gerar notificação. Isso define se o handle de salvar dispara `notification.show` só no sucesso ou também na falha.
>
> * **Sucesso e falha (Recomendado)** - Notifica nos dois casos; na falha mostra a mensagem do erro e mantém o card em edição.
> * **Somente sucesso** - Notifica apenas quando salva; a falha aparece só como erro no próprio formulário.

# 5. After the Answers

* Treat the answers as decided. Do not ask about them again.
* Ask a new round only if the answers create a new real ambiguity.
* If everything is clear from the start, proceed directly without asking anything.

# 6. Rules

* Never guess when a real ambiguity exists.
* Never ask when there is none.
