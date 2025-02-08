# 🔭 spaced

[Check out spaced here!](https://spaced.zsheng.app/)

🔭 spaced is a modern flashcard app that helps you learn faster and remember longer.
It uses spaced repetition to help you learn more efficiently.

Note: This is project is still in early development.
If you have any suggestions or feedback, please feel free to open an issue.

## NOTICE

The second one is always better.

I've been building a new version of spaced that is local-first, works online, is much faster, has better UX, and shows you your stats.

Check it out [here](https://github.com/zsh-eng/spaced2).

## Motivation

Spaced repetition is proven to be one of the **most effective ways to learn**.

Currently, there are many great apps out there that use spaced repetition, such as
[Anki](https://ankiweb.net/), [SuperMemo](https://www.supermemo.com/en/blog/twenty-rules-of-formulating-knowledge),
and [RemNote](https://www.remnote.com/).

Personally, I use `obsidian-spaced-repetition`, which I love because of the tight integration with Obsidian.
I believe that [markdown](https://www.markdownguide.org/) is the best way to store your flashcards.

However, one aspect that I dislike about both `obsidian-spaced-repetition`
(and other tools like ObsidianToAnki)
is the separator syntax that is used to create flashcards.
For my own personal workflow, I use Obsidian to write notes
, but writing flashcards adds clutter.
Fundamentally, I believe that flashcards should be treated
as separate entities that are _colocated_ with your notes,
but different in the following ways:

1. Flashcards should only be seen during review.
2. There is no need to search / index / tag flashcards in the same way that notes are searched.
   The whole point of flashcards is to only appear when they need to be reviewed.

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

Overriden and overloaded methods: static or dynamic binding?
?
Overridden methods are resolved using **dynamic binding**, and therefore resolves to the implementation in the actual type of the object.
In contrast, overloaded methods are resolved using **static binding**.

<!--SR:!2024-03-12,85,271-->
```

Here's my ideal syntax:

```markdown
#### Dynamic and Static Binding

**Dynamic Binding (Late Binding)**: A mechanism where _method calls_ in code are resolved at **runtime** rather than at compile time.
Overriden methods are resolved using **dynamic binding**.

<!-- id:<some-card-id-here, where flashcards are stored separately> -->

**Static binding**: When a _method call_ is resolved at _compile_ time.
Overloaded methods are resolved using **static binding**.

<!-- id:<some-card-id-here, where flashcards are stored separately> -->
```

### Why not just use local storage? Why not keep it all in Obsidian?

1. I don't always have access to my Obsidian vault - I want to be able to review flashcards on the go.
2. I want to be able to easily share flashcards with others.
3. I want to create a UI/UX that _I_ personally enjoy using.
   One of the big criticisms that I have of `obsidian-spaced-repetition` is that it doesn't store the history of your reviews.
   You also cannot undo a review, which is annoying if you accidentally mark something as "easy".

## Self Hosting

If you want to self-host this project, you can do so by following these steps:

1. Fork the repository.
2. Generate a new `AUTH_SECRET` with the following command

   ```shell
   pnpm dlx auth secret
   ```

3. Create a new [GitHub OAuth App](https://authjs.dev/guides/configuring-github).
4. Fill in the `.env` file with the `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.
5. Create a new database in [Turso](https://turso.dev/).
6. Fill in the `.env` file with the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
7. (Optional): To support image uploads, I use a custom
   [Cloudflare Worker](https://github.com/zsh-eng/image-upload).
   If you don't want to, just fill in a dummy value for
   `CLOUDFLARE_IMAGE_UPLOAD_WORKER_TOKEN`.
8. Run the following command to create the database tables:

   ```shell
   pnpm db:push
   ```

9. Deploy the app to [Vercel](https://vercel.com/).
10. Done! You should now be able to access your own instance of **spaced**.

## Resources

- [SuperMemo's Twenty Rules of Formulating Knowledge](https://www.supermemo.com/en/blog/twenty-rules-of-formulating-knowledge)

## Acknowledgements

This project was built using the following tech stack:

- Next.js
- **UI:** TailwindCSS, shadcn/ui
- **Backend**: tRPC
- **Database**: Turso
- **ORM**: Drizzle

Great Libraries:

- **Spaced Repetition**: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- **Swipe gestures**: [react-swipeable](https://www.npmjs.com/package/react-swipeable)
- **Markdown editing**: [Milkdown](https://milkdown.dev/)
- **Icons**: [Lucide](https://lucide.dev/icons/)

I've also learned a lot from the following resources:

- [Lexical](https://lexical.dev/): referenced their implementation of undo / redo
- [ts-fsrs-demo](https://github.com/ishiko732/ts-fsrs-demo): structure for a spaced repetition app
- [Radix UI](https://www.radix-ui.com/primitives/docs/components/toast): building swipe gestures
- [obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition)

Finally, a special thanks to @ishiko732 for answering questions regarding `ts-fsrs` and spaced repetition.
