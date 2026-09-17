# Kimi CEO Zhilin Yang: "Claude didn't win on reasoning — they bet everything on agents"

> Notes on the YouTube clip (https://youtu.be/qHd1CnouIMI), a segment from the Zhang Xiaojun Podcast interview with Yang Zhilin (Moonshot AI / Kimi founder & CEO), Episode 113 — "K2, Agentic LLMs, Brains in Vats, and the Beginning of Infinity".
>
> The clip covers roughly minutes 17–24 of the original interview: the L1–L5 roadmap, Claude's agent bet, and "K2 helping to build K3".
>
> Transcript reconstructed from the original interview's subtitles (auto-captions cleaned where they garbled terms like "agent", "Claude", "RL"). Wording may differ slightly from the clip's exact edit, but the segment's content is faithful.
>
> Note: the clip's title is somewhat sensationalized — Yang did not say Claude "bet wrong"; he said Claude's early bet on agents was smart and worked, but that in the long run you need both strong agents and strong reasoning.

---

## 1. Transcript (original Chinese, cleaned)

*Segment: ~00:17:16 – 00:23:54 of the original interview. 张 = host Zhang Xiaojun, 杨 = Yang Zhilin.*

**张：** 说到主线，你看OpenAI设置了L1到L5——L1是Chatbot，第二是Reasoner，第三是Agent。为什么有了Chatbot和Reasoner之后才有Agent？为什么后面又是创新者（Innovator）和组织者（Organization）？它的逻辑是什么？

**杨：** 它讲的是能力一步一步的依赖。但实际看起来，Agent的上限取决于你有很强的reasoning能力，可并不是说必须按这个顺序。假设你先做出Agent能力，再去做现在狭义上的reasoning（long CoT），我觉得实际上也是成立的。你可以认为Claude的路线就是bet在这一点上：它在reasoning上做的并不是那么多，但在Agent上做得非常好。因为技术背后对应的是两种不同的test-time scaling范式：一种是通过多轮交互来scale——你需要跟外界交互、使用很多次工具，所以scale的是轮次；另一种是纯粹的思考，并没有什么交互，只是一直在那想。这是两种不同的scaling维度。

你可以看到，Claude很多模型的reasoning performance并不是非常高，但它在Agent上的performance很高。这两个东西并不一定是依赖关系。但有一点：如果你想做最好的Agent，让它解决最复杂的任务，那你最终需要reasoning能力也很强。所以在研发上它不是必然的顺序，但你要达到Agent的最好，就需要把reasoning也做到最好。

**张：** 当你有了Agent之后，为什么接下来对应的是Innovation？

**杨：** 最关键的一点是：你的模型到底什么时候能参与到模型的开发。比如说我们希望K2能够参与到K3的开发里面。如果你没有这个Agentic能力，你其实很难做到这个事情。但当你有Agentic能力之后，它就可以去提出新的想法、做对应的实验、分析实验结果、得到结论、迭代下一版想法，或者优化某个infra的性能——这些都需要很强的Agentic能力。所以Innovation产生的关键，就是看模型什么时候能参与到模型本身的研发里。

**杨（续）：** Organization也不一定完全线性。现在已经看到趋势了：当你有一个Agent，你可以把它拓展成一个multi-agent系统——从一个Agent fork出很多个不同的Agent，让它并行做不同的事情，再合并起来：有的写测试，有的写文档，有的设计整体软件框架，有不同分工。所以reasoning和Agent相当于Innovation和Organization的前提。

**张：** 我理解reasoning是Agent的前提？

**杨：** 如果想解决最复杂的Agent问题，不会推理是很难的。但假设没有推理这种范式，你还是可以一定程度上做一些Agent任务——你不需要在思考过程中输出几千个token去推理，也可以通过多轮交互从环境里得到反馈：写一些测试、跑这个测试，你也能解决相对复杂的任务。这就是为什么Claude的模型在一些场景做得更好——背后是不同的技术bet。但最终你要往山顶再爬几步，两个都要，只是时间问题。Organization和Innovation也一样——不同的技术bet会让短期路径有区别，而短期路径的区别会有影响，因为你面对的是一个动态的市场。

**张：** Innovation的标志是模型的自我迭代，那Organization呢？

**杨：** Organization就是一个multi-agent系统。现在的挑战是：怎么很好地端到端训练multi-agent系统，不要过拟合到某几种Agent类型，让它有更好的泛化性。

**张：** Organization是雪山的峰顶吗？

**杨：** 我觉得也不是，可能它真的没有顶。这几个能力都会随着时间持续变得更好。推理能力的上限到底在哪里，今天也不好说——虽然它看起来只是L2，但要做到很强很强的推理，今天也还有很大空间。

**张：** 你怎么看L1到L5这个分级？

**杨：** 我觉得它是几个重要的技术milestone，但并不完全是串行关系——不是我们预期的一个东西马上被解决掉、再去解决下一个。它们可能同时都在提升。比如reasoning：你要真正解决开放问题、做很好的创新、提出新的模型架构，那你的推理能力又需要有更高的要求。所以这几个能力会持续提升。

---

## 2. English translation

**Zhang:** OpenAI laid out levels L1 to L5 — L1 is the chatbot, L2 the reasoner, L3 the agent. Why does the agent only come after the chatbot and the reasoner? And why do the "innovator" (L4) and "organization" (L5) come after that? What's the logic?

**Yang:** The idea is that each capability builds on the previous one. But in practice, while an agent's ceiling does depend on strong reasoning, the order isn't mandatory. Suppose you built agentic ability first and only then developed reasoning in the narrow sense (long chain-of-thought) — I think that works too. You could say Claude's route is a bet on exactly this: they didn't do that much on reasoning, but they're extremely good at agents. Behind this are two different paradigms of "test-time scaling": one scales the number of interaction rounds — the model interacts with the outside world and uses tools many times; the other scales pure thinking, with no interaction at all. Two different dimensions.

You can see many Claude models don't score especially high on reasoning, yet their agentic performance is very high. The two aren't strictly dependent. But here's the catch: if you want to build the *best* agent — one that solves the hardest tasks — you ultimately need strong reasoning too. So it's not a required sequence in R&D, but to make agents the best they can be, you also need to make reasoning the best it can be.

**Zhang:** Once you have agents, why does "innovation" come next?

**Yang:** The key question is: when can your model participate in developing the model itself? For example, we want K2 to participate in building K3. Without agentic capability, that's nearly impossible. But once a model has it, it can propose new ideas, run experiments, analyze results, draw conclusions, iterate to the next version, or optimize some piece of infrastructure — all of which demands strong agentic skill. So the birth of "innovation" hinges on when the model can join its own R&D.

**Yang (cont.):** "Organization" isn't strictly linear either. We already see the trend: take one agent and fork it into a multi-agent system — many agents working in parallel, then merging results: one writes tests, one writes docs, one designs the software architecture. A division of labor. Reasoning and agents are the foundation for innovation and organization.

**Zhang:** So reasoning is the prerequisite for agents?

**Yang:** For the hardest agentic problems, you can't get far without reasoning. But without the reasoning paradigm you can still do many agentic tasks — instead of outputting thousands of "thinking" tokens, the model gets feedback from the environment over multiple rounds: write some tests, run them. That's exactly why Claude's models do better in certain scenarios — different technical bets. But in the end, to climb higher up the mountain, you need both; it's only a matter of time. Same for innovation and organization — different bets lead to different short-term paths, and those differences matter, because the market is dynamic.

**Zhang:** Innovation is marked by the model iterating on itself. What about organization?

**Yang:** Organization is a multi-agent system. The challenge now is training such systems end-to-end without overfitting to a few agent types — you want better generalization.

**Zhang:** Is "organization" the summit of the snow mountain?

**Yang:** I don't think so. Maybe there is no summit. All these capabilities keep improving over time. Where's the ceiling of reasoning? Hard to say even today — it looks like "just L2," but truly great reasoning still has huge headroom.

**Zhang:** How do you view the L1–L5 scale?

**Yang:** They're important technical milestones, but not a strict sequence — it's not "finish one, then start the next." They can all improve in parallel. Take reasoning: to solve open problems, to innovate, to invent new model architectures, you need even stronger reasoning. So all of these capabilities will keep rising.

---

## 3. Summary of the points

1. **Two ways to make AI smarter at work time ("test-time scaling")**: think longer in its own head (reasoning), or act in the world over many rounds using tools (agents). Both lead to the same goal.
2. **Claude bet on agents first, reasoning second — and it worked.** The L1→L5 ladder isn't a strict order; you can jump ahead on one rung and backfill another.
3. **But there's a catch:** to build the *best* agent for the hardest tasks, you still need top-tier reasoning and a strong base model. Tool-wrapping alone has a ceiling.
4. **The next leap is recursive self-improvement:** "Innovation" (L4) begins when a model helps build its successor — Yang's concrete goal is **K2 helping to develop K3**, which is impossible without agentic skills.
5. **"Organization" (L5) = teams of AI agents** working in parallel with division of labor — already emerging today.
6. **The mountain has no summit.** All these capabilities keep improving; AGI is a direction, not a finish line.

---

## 4. What this means for you — a plain-English guide

*For non-technical people who want to use Kimi to make life and work easier.*

### The big ideas, translated

**"Chatbot → Agent": AI is going from answering questions to doing whole jobs.**
An *agent* is simply an AI that doesn't just talk — it acts. It can search the web, open files, run code, check its own results, and keep going for many steps until the task is done. Yang's phrase "brain in a vat" means an AI that only thinks in isolation; an agent is that same brain *with hands*.
👉 **For you:** Stop asking Kimi only one-line questions. Hand it complete tasks: "Research these five competitors and make me a comparison table," "Turn these notes into a slide deck," "Plan my trip and check real prices." Kimi's agent features (Deep Research, PPT, spreadsheets, coding) are built exactly for this.

**"A great agent needs a great base model."**
The *base model* is the AI's actual brain; everything else — buttons, apps, wrappers — is packaging. A clever wrapper around a weak brain still fails on hard, unfamiliar problems. That's why Kimi focuses on making the brain itself smarter.
👉 **For you:** When choosing AI tools, the quality of the underlying model matters more than flashy features. And it means the Kimi you use keeps getting better at the *same* tasks, for free, as the model improves.

**"Reasoning vs. doing — you eventually need both."**
*Reasoning* = thinking carefully before answering. *Agentic ability* = trying things, getting feedback, correcting course. Some AI is a strong thinker, some is a strong doer; the best is both.
👉 **For you:** Match the mode to the job. Quick question → just ask. Complex, multi-step job → give it room to work in steps, use tools, and show you intermediate results before it finishes.

**"K2 helps build K3": AI is starting to improve itself.**
Kimi's goal is for today's model to help design and test the next one — like an employee who trains their own successor. This is why progress is accelerating.
👉 **For you:** Whatever "AI can't do" list you have, re-test it every few months. Tasks that failed half a year ago often just work now.

**"Generalization" — the honest limitation.**
Yang admits today's agents are best at tasks similar to what they practiced, and shakier on totally new situations (*generalization* = handling things never seen before). Benchmark scores can look great while real-world use disappoints.
👉 **For you:** Trust, but verify — especially on unusual or high-stakes tasks. Let Kimi do the first 80%, then review the output like you would a capable intern's work.

**"Manage with RL, not SFT" — the best prompting tip hidden in this interview.**
*SFT* (supervised fine-tuning) = telling someone exactly how to do every step. *RL* (reinforcement learning) = telling them the goal and what a good result looks like, and letting them find the path. Yang manages his team the second way — and it's also the best way to use AI.
👉 **For you:** Don't micromanage Kimi with rigid instructions. Instead describe: the goal, what "done well" looks like, constraints (length, format, tone, deadline), and an example if you have one. Then let it figure out the steps — and give feedback ("more concise," "less jargon") so it can adjust.

**"Organization" = soon you'll manage a small team of AIs.**
The near future is multiple agents splitting work — one researches, one writes, one checks. Kimi is already moving this way (e.g., multi-agent features).
👉 **For you:** The most valuable skill of the next decade isn't coding — it's *delegating well*: breaking work into clear pieces, defining quality, and reviewing results. That's a skill you can start practicing with Kimi today.

### The one-paragraph takeaway

Yang's message is: AI is shifting from a smart chat box into a tireless colleague that can *do* multi-step work — and the models improving fastest are the ones built to act in the real world, not just ace tests. For everyday users, the winning move is simple: **give Kimi real tasks with clear goals, not just questions; let it work in steps; check its output; and keep coming back, because what it can do grows every few months.** As Yang puts it, AI is "an amplifier of human civilization" — the people who benefit most are the ones who learn to point that amplifier at their actual work.

---

*Prepared from the Zhang Xiaojun Podcast interview (Ep. 113) with Yang Zhilin. Sources: original interview subtitles (via the bob798/ai-founder-interviews archive), clip page metadata.*
