# 🔭 spaced

[Check out spaced here!](https://spaced-coral-xi.vercel.app/)

🔭 spaced is a modern flashcard app that helps you learn faster and remember longer.
It uses spaced repetition to help you learn more efficiently.

Note: This is project is still in early development.
If you have any suggestions or feedback, please feel free to open an issue.

## Motivation

Spaced repetition is one of the most effective ways to learn.
In fact, there are many great apps out there that use spaced repetition, such as
Anki, SuperMemo, RemNote, and Obsidian Spaced Repetition.

Personally, I use `obsidian-spaced-repetition`, which is great because it integrates with Obsidian.
I believe that markdown is the best way to store your notes.

However, I greatly dislike the separator syntax used to create flashcards,
for both `obsidian-spaced-repetition` and Obsidian to Anki.

For my own personal workflow, I want to be able to write notes in markdown that are easy to read.
Personally, I treat flashcards as separate entities that are _colocated_ with my notes,
but different in the following ways:

1. Flashcards are only seen during review.
2. There is no need to search / index / tag flashcards in the same way that notes are searched.
   The whole point of flashcards is to only appear when they need to be reviewed.
3. The separator syntax adds a lot of clutter to my notes.

Thus, I created **spaced**, which focuses on handling the spaced repetition aspect of learning.
This way, I can focus on writing notes that are easy to read and understand (in Obsidian),
and create flashcards that are effective for spaced repetition (in spaced).

### Example

Here's an example of my existing notes using Obsidian Spaced Repetition:

```markdown
#### Dynamic and Static Binding

What is dynamic binding (aka late binding)?
?
A mechanism where _method calls_ in code are resolved at **runtime** rather than at compile time.

<!--SR:!2024-01-02,25,249-->

What is static binding?
?
When a _method call_ is resolved at _compile_ time.

<!--SR:!2024-03-24,94,271-->

[[#Method Overriding|Overriden]] and [[#Method Overloading|overloaded]] methods: static or dynamic binding?
?
Overridden methods are resolved using **dynamic binding**, and therefore resolves to the implementation in the actual type of the object.
In contrast, overloaded methods are resolved using **static binding**.

<!--SR:!2024-03-12,85,271-->
```

Here's my ideal syntax:

```markdown
#### Dynamic and Static Binding

**Dynamic Binding (Late Binding)**: A mechanism where _method calls_ in code are resolved at **runtime** rather than at compile time.
Override methods are resolved using **dynamic binding**.

<!-- id:<some-card-id-here, where flashcards are stored separately> -->

**Static binding**: When a _method call_ is resolved at _compile_ time.
Overloaded methods are resolved using **static binding**.

<!-- id:<some-card-id-here, where flashcards are stored separately> -->
```

## Resources

- [SuperMemo's Twenty Rules of Formulating Knowledge](https://www.supermemo.com/en/blog/twenty-rules-of-formulating-knowledge)

## Acknowledgements

This project was built using the following tech stack:

- Next.js
- **UI:** TailwindCSS, shadcn/ui
- **Backend**: tRPC
- **Database**: Turso
- **ORM**: Drizzle
- **Spaced Repetition**: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)

I've also learned a lot from the following resources:

- [Lexical](https://lexical.dev/)
- [obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition)
- [ts-fsrs-demo](https://github.com/ishiko732/ts-fsrs-demo)
