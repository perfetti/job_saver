--
-- PostgreSQL database dump
--

-- Dumped from database version 13.21 (Postgres.app)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id text NOT NULL,
    job_id text NOT NULL,
    status text DEFAULT 'started'::text NOT NULL,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    title text NOT NULL,
    company text NOT NULL,
    location text,
    description text,
    salary_lower_bound integer,
    salary_upper_bound integer,
    salary_currency text,
    requirements text,
    application_url text,
    source_url text,
    posted_date text,
    extracted_at timestamp(3) without time zone,
    saved_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    excluded boolean DEFAULT false NOT NULL,
    tags text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id text DEFAULT 'default'::text NOT NULL,
    linkedin_url text,
    resume_data text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, status, started_at, submitted_at, notes, created_at, updated_at) FROM stdin;
0a9ff34a-4f25-4023-a1fa-037629a1da92	1762908369725-2hji57lhp	started	2025-11-18 19:26:47.154	\N	\N	2025-11-18 19:26:47.154	2025-11-18 19:26:47.154
0180d97c-7b14-4a52-ac8b-a345c15bb0dc	1763494031467-7bw0t4qux	started	2025-11-18 19:27:18.732	\N	\N	2025-11-18 19:27:18.732	2025-11-18 19:27:18.732
f22e1ae6-7e7a-4e41-92fb-9457c530a1ed	1763494132081-wciubcuo8	started	2025-11-18 19:29:01.375	\N	\N	2025-11-18 19:29:01.375	2025-11-18 19:29:01.375
3f1ea45d-9528-4455-b73c-a537f70e09a0	1763494605643-erki9ao6j	started	2025-11-18 19:43:58.669	\N	\N	2025-11-18 19:43:58.669	2025-11-18 19:43:58.669
ef9d6c4d-0d5c-43a0-8619-18d4d428c63c	1763495827896-0bzjr4ci9	started	2025-11-18 19:57:18.089	\N	\N	2025-11-18 19:57:18.089	2025-11-18 19:57:18.089
0d7e79fb-6dc7-4da3-9675-ee98ac63adc8	1763497327472-lsowkmte8	started	2025-11-18 20:22:13.04	\N	\N	2025-11-18 20:22:13.04	2025-11-18 20:22:13.04
c317c356-cccf-45ee-9d0d-f33b6cb88bb5	1763502202411-vbcbq31n0	started	2025-11-18 21:50:15.114	\N	\N	2025-11-18 21:50:15.114	2025-11-18 21:50:15.114
6a4bae31-7a45-4df0-8c5c-f2a518739d5b	1763502972267-74rv0yqfn	started	2025-11-18 21:56:44.18	\N	\N	2025-11-18 21:56:44.18	2025-11-18 21:56:44.18
ec7145f4-100d-4f27-8ecb-e476757ec30b	1763503457930-51mouu6qj	started	2025-11-18 22:04:29.618	\N	\N	2025-11-18 22:04:29.618	2025-11-18 22:04:29.618
de3005a7-4734-45e6-a79e-a3a1c2f9b813	1763507715031-ojne07et1	started	2025-11-18 23:15:32.601	\N	\N	2025-11-18 23:15:32.601	2025-11-18 23:15:32.601
5426c1c2-a955-42cb-9bca-8d10e15b7050	1763508517761-ctaig8pwf	started	2025-11-18 23:28:51.941	\N	\N	2025-11-18 23:28:51.941	2025-11-18 23:28:51.941
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, company, location, description, salary_lower_bound, salary_upper_bound, salary_currency, requirements, application_url, source_url, posted_date, extracted_at, saved_at, excluded, tags, created_at, updated_at) FROM stdin;
1762908369725-2hji57lhp	Software Engineer	Jane Street	["New York"]		200000	300000	\N	["Top-notch programming skills","Deep experience with—and love for—technology","Strong interpersonal skills"]	\N	https://www.janestreet.com/join-jane-street/position/4274288002/	\N	2025-11-12 00:46:09.299	2025-11-12 00:46:09.789	f	["quant","finance"]	2025-11-12 00:46:09.79	2025-11-12 00:46:18.876
1763158990785-45nvbz6bu	Engineering Manager, Developer Impact (Developer Experience)	Zapier	["NAMER","Remote"]	Lead the Developer Impact team, improve developer productivity, and apply AI to developer workflows.	187800	281600	USD	["Developer Productivity Leader: You have experience leading teams focused on developer productivity, developer experience, or internal platforms.","Skilled Team Builder: You’re a proven engineering leader (with a few years of management under your belt) who knows how to hire, develop, and retain great talent.","Experimental & Data-Driven: You thrive in a hypothesis-driven environment. You love to experiment with new tools or processes to improve workflow, measure the results with data, and iterate based on what you learn.","Technical Aptitude: You’ve shipped production code and have a solid grasp of modern software development practices.","Applied AI Enthusiast: You have interest or experience in applying AI/ML to developer workflows.","Product Mindset: You think like a product manager when it comes to internal tooling.","Strong Communicator & Collaborator: You build strong relationships across teams."]	\N	https://jobs.ashbyhq.com/zapier/0bff923f-073c-4f60-ac39-54742da1b2d7	\N	2025-11-14 22:23:10.774	2025-11-14 22:23:10.848	f	[]	2025-11-14 22:23:10.849	2025-11-14 22:23:16.951
1763159023123-dypjdy7t5	Staff Engineer, Applied AI	Zapier	["Americas (North, Central and South America)"]	Make Zapier Agents the #1 way to get real work done with AI: A year from now, Agents is the obvious choice—and you’ve delivered features, spotted differentiation opportunities, advised on product strategy, and up-leveled how our teams and customers build with Agents.	274800	412200	USD	["Proven engineering impact: You’ve driven outcomes in complex, cloud-based systems used by real customers. Bonus: you’ve helped win or expand enterprise deals—leading POCs, navigating security/compliance reviews, or shaping product requirements to land enterprise adoption.","LLM expertise: You have at least 2 years or equivalent depth of hands-on work with large language models in production, including user-facing products leveraging agent architectures.","Evaluation & retrieval systems: You have direct experience deploying evaluation frameworks for LLMs (performance, reliability, bias) and building Retrieval-Augmented Generation (RAG) systems.","Builder first: You lead through hands-on contribution—pairing with product teams, unblocking adoption, modeling best practices, and shipping.","Pragmatic judgment over novelty: You separate signal from hype. You’re comfortable saying “not ready for production” (and explaining why), and you partner with product to decide when to keep exploring vs. when to lock down, standardize, and scale—using results from evals, user impact, and clear cost/latency tradeoffs.","You design for scale and ambiguity: You can design systems and solutions in complex, high-scale environments—where priorities are fluid and ambiguity is the norm."]	\N	https://jobs.ashbyhq.com/zapier/e3453e49-0659-4863-8e9f-fa8af7172c85	September 12, 2025	2025-11-14 22:23:43.115	2025-11-14 22:23:43.124	f	["ai"]	2025-11-14 22:23:43.125	2025-11-14 22:23:48.043
1763159801944-hbkgvyb7v	Staff Software Engineer	Teleskope	["New York, New York"]	Join a high-performing team of engineers to contribute to the development of core Teleskope products and features.	200000	230000	USD	["10+ years of experience as an engineer","Strong ability to positively influence engineering culture and mentor junior engineers","Solid back-end development skills, preferably in Golang","Skilled at front-end development in TypeScript / React","Well-versed in relational databases, SQL, and schema design","Experienced scaling in both cloud infrastructure and code"]	\N	https://jobs.ashbyhq.com/teleskope/2545afed-1a16-4dbe-8828-a4decebb2102?embed=js	\N	2025-11-14 22:36:41.929	2025-11-14 22:36:41.947	f	[]	2025-11-14 22:36:41.949	2025-11-14 22:36:45.86
1762271173337-v0yrl96vu	Lead Engineer	Fidelity Investments	Smithfield, RI, Merrimack, NH, Jersey City, NJ, Westlake, TX	As a Lead Engineer at Fidelity Labs, you will lead the development of innovative, customer-facing Blockchain products for a greenfield project.	126000	255000	USD	["10+ years of proven experience designing and leading all aspects of large-scale, secure, and highly available financial or Blockchain systems","Proficiency with document, distributed, and relational databases such as MongoDB, DynamoDB, PostgreSQL (JSONB), and MySQL"]	\N	https://jobs.fidelity.com/en/jobs/2119421/lead-engineer/	October 29, 2025	2025-11-04 15:46:13.334	2025-11-04 15:46:13.337	f	\N	2025-11-15 00:01:43.38	2025-11-15 00:01:43.38
1762272648495-vf1y8jp61	Director, Software Engineering (Python, Individual Contributor)	Fidelity Investments	Boston, MA, Merrimack, NH, Jersey City, NJ	Director, Software Engineering – Asset Management Technology\nThe Role...	126000	255000	USD	["A Bachelor’s or Master's Computer Science or relevant field, with ten years plus of industry experience.","Proficient in deploying software products into production capable of handling large volumes of data at scale.","Design, develop, and maintain robust, scalable, and secure Python-based applications and services.","Strong understanding of Python internals, performance tuning, and advanced language features.","Write clean, idiomatic, and well-documented Python code following PEP8 and enterprise coding standards.","Optimize Python applications for performance, memory usage, and concurrency.","Ability to orchestrate solutions within a cloud-based environment","Strong understanding of standard methodologies for large scale application design, SOA, microservices, distributed compute, containers, and use of the cloud."]	\N	https://jobs.fidelity.com/en/jobs/2117424/director-software-engineering-python-individual-contributor/	October 30, 2025	2025-11-04 16:10:48.492	2025-11-04 16:10:48.495	f	\N	2025-11-15 00:01:43.383	2025-11-15 00:01:43.383
1762271165488-wa9qqzpqv	Director, Software Engineering (Python, Individual Contributor)	Fidelity Investments	["Merrimack, NH","Jersey City, NJ"]	Develop software solutions that unlock the capabilities of Generative AI in finance. Strong understanding of Python internals and ability to design, develop, and maintain robust applications.	126000	255000	USD	["Proficient in deploying software products into production","Design, develop, and maintain robust, scalable, and secure Python-based applications and services"]	\N	https://jobs.fidelity.com/en/jobs/2117424/director-software-engineering-python-individual-contributor/	November 12, 2025	2025-11-15 01:26:28.561	2025-11-04 15:46:05.488	f	\N	2025-11-15 00:01:43.382	2025-11-15 01:26:28.562
1762272655766-ee0pukeln	Lead Software Engineer, Back End	Capital One	McLean, VA, New York, NY	Build and pioneer in the technology space. Lead a portfolio of diverse technology projects and a team of developers with deep experience in distributed microservices, and full stack systems to create solutions that help meet regulatory needs for the company.	193400	220700	USD	["Bachelor’s Degree","At least 4 years of professional software engineering experience","At least 1 year experience with cloud computing (AWS, Microsoft Azure, Google Cloud)","Master's Degree (preferred)","7+ years of experience in at least one of the following: Java, Scala, Python, Go, or Node.js (preferred)","2+ years of experience with AWS, GCP, Azure, or another cloud service (preferred)","4+ years of experience in open source frameworks (preferred)","1+ years of people management experience (preferred)","2+ years of experience in Agile practices (preferred)"]	\N	https://www.levels.fyi/jobs?jobId=114630127886705350	a month ago	2025-11-04 16:10:55.761	2025-11-04 16:10:55.767	f	\N	2025-11-15 00:01:43.384	2025-11-15 00:01:43.384
1762272926547-jguvpc4t3	Principal Developer Technology Engineer	Nvidia	California, United States, Santa Clara, CA, New York, United States, New York, NY	Research and develop techniques to accelerate top CSP workloads on NVIDIA's computing platform including advanced CPUs, GPUs and interconnects. Collaborate with libraries, tools, system software architecture, hardware, and research teams at NVIDIA to influence the design of next-generation programming models, software, and architectures.	272000	425500	USD	["Masters degree in Computer Science, Computer Engineering, or related computationally focused science degree (or equivalent experience)","10+ years of relevant work experience or research","Programming proficiency in C/C++ with a deep understanding of software design, programming techniques, and algorithms","A background that includes parallel programming, ideally CUDA C/C++. Hands on experience doing low-level performance optimizations.","In-depth expertise with CPU and GPU architecture fundamentals. Strong math skills, including linear algebra, for problem-solving and performance modeling"]	\N	https://www.levels.fyi/jobs?locationSlug=united-states&locationSlugs=new-york-city-area%2Cnew-jersey-usa%2Cprinceton-usa-5%2Cphiladelphia-area&minMedianTotalCompensation=200000&offset=5&standardLevels=mid_staff%2Cprincipal%2Cmanager%2Cdirector%2Cexecutive&jobId=134206260256875206	24 days ago	2025-11-04 16:15:26.543	2025-11-04 16:15:26.547	f	\N	2025-11-15 00:01:43.386	2025-11-15 00:01:43.386
1762273191023-cv1f5rzi7	Backend Software Engineer, Enterprise Agents	OpenAI	San Francisco, New York City	Leverage Engineering - San Francisco and New York City. Apply now (opens in a new window). About the Team... etc.	325000	405000	USD	["7+ years of professional engineering experience (excluding internships) in relevant roles at tech and product-driven companies","Former founder, or early engineer at a startup who has built a product from scratch is a plus","Proficiency with JavaScript, React, and other web technologies","Proficiency with a backend language (we use Python)","Some experience with relational databases like Postgres/MySQL","Interest in AI/ML (direct experience not required)","Proven ability to thrive in fast-growing, product-driven companies by effectively navigating loosely defined tasks and managing competing priorities or deadlines"]	\N	https://openai.com/careers/backend-software-engineer-enterprise-agents-san-francisco/	\N	2025-11-04 16:19:51.021	2025-11-04 16:19:51.023	f	\N	2025-11-15 00:01:43.388	2025-11-15 00:01:43.388
1762273198567-4wqgdr38u	Community Affairs Lead - Stargate	OpenAI	Datacenter Design, Remote, US	Primary bridge between OpenAI and the communities where we develop data centers.	192000	236000	USD	["8+ years in community affairs, public engagement, or corporate communications","Proven track record engaging diverse community stakeholders for large infrastructure or technology projects","Strong public speaking and facilitation skills","Ability to manage sensitive political and reputational issues","Experience integrating community benefits (workforce, education, infrastructure support) into development strategies","Collaborative and adaptable, with experience working across government, community, and corporate teams"]	https://openai.com/careers/community-affairs-lead-stargate-remote-us/	https://openai.com/careers/community-affairs-lead-stargate-remote-us/	\N	2025-11-04 16:19:58.565	2025-11-04 16:19:58.567	f	\N	2025-11-15 00:01:43.389	2025-11-15 00:01:43.389
1763494132081-wciubcuo8	Software Engineering Manager	Adobe	["New York, New York, United States of America"]	Engineering at Frame.io is about more than just writing code - it's crafting products that inspire creativity and allow our users to do great work.	143700	289900	USD	["A love of full-stack engineering, technical leadership, people management, product design, and using exceptional products","Experience planning, implementing and delivering projects with multiple engineers, and multiple squads.","Strong desire to foster a working environment that’s enriching, inclusive, and safe, where people of all backgrounds and identities feel welcome"]	\N	https://careers.adobe.com/us/en/job/ADOBUSR160918EXTERNALENUS/Software-Engineering-Manager?utm_source=levels.fyi&utm_medium=phenom-feeds&source=levels.fyi&ref=levels.fyi&src=levels.fyi	10/13/2025	2025-11-18 19:28:52.068	2025-11-18 19:28:52.083	f	[]	2025-11-18 19:28:52.084	2025-11-18 19:28:54.111
1762273011907-b06c5upbp	Technical Program Manager, AI and ML Software	Nvidia	["Santa Clara, CA","United States"]	The AI PMO Team is looking for a Technical Program Manager to lead initiatives and programs focused on Deep Learning Inference, with the goal of supporting NVIDIA's top AI Inference researchers and engineers in driving the future of deep learning.	192000	368000	USD	["Postgraduate degree in Computer Science or Artificial Intelligence or equivalent experience.","10+ years program management experience including proven ability managing global projects, adaptable to multiple time zones.","Ability to think strategically and tactically and to build consensus to make programs successful.","Proven experience to creatively resolve technical issues and resource conflicts.","Thorough working knowledge of software engineering best practices and hardware bring-up.","You should be detail oriented with shown ability to multitask, in a dynamic environment with shifting priorities and changing requirements.","We need you to have hands-on experience with a fast-paced software development environment.","Excellent communication and technical presentation skills."]	\N	https://www.levels.fyi/jobs/company/nvidia?locationSlug=united-states&locationSlugs=new-york-city-area%2Cnew-jersey-usa%2Cprinceton-usa-5%2Cphiladelphia-area&minMedianTotalCompensation=200000&standardLevels=mid_staff%2Cprincipal%2Cmanager%2Cdirector%2Cexecutive&jobId=114459153828586182	\N	2025-11-15 01:25:06.567	2025-11-04 16:16:51.907	f	\N	2025-11-15 00:01:43.388	2025-11-15 01:25:06.568
1762273270986-o2r5x9yhm	Full Stack Software Engineer, Enterprise Agents	OpenAI	San Francisco, New York City	Leverage Engineering - Full Stack Software Engineer, Enterprise Agents	325000	405000	USD	["4+ years of professional engineering experience (excluding internships) in relevant roles at tech and product-driven companies","Former founder, or early engineer at a startup who has built a product from scratch is a plus","Proficiency with JavaScript, React, and other web technologies","Proficiency with a backend language (we use Python)","Some experience with relational databases like Postgres/MySQL","Interest in AI/ML (direct experience not required)","Proven ability to thrive in fast-growing, product-driven companies by effectively navigating loosely defined tasks and managing competing priorities or deadlines"]	https://openai.com/careers/full-stack-software-engineer-enterprise-agents-san-francisco/	https://openai.com/careers/full-stack-software-engineer-enterprise-agents-san-francisco/	\N	2025-11-04 16:21:10.985	2025-11-04 16:21:10.987	f	\N	2025-11-15 00:01:43.39	2025-11-15 00:01:43.39
1762303870833-4lqst06m7	Senior Full-Stack Engineer	OpenRouter	Remote (US)	Build and maintain user-friendly, high-performance interfaces using React and Next.js. Design, implement, and deploy scalable API functionality using Cloudflare Workers and edge-first architectures.	175000	200000	USD	["4+ years of professional experience in full-stack development","Proficient in React, TypeScript, Next.js, and JS runtimes","Experience with Cloudflare Workers or other edge-first serverless platforms (bonus points)","Strong communication skills and a team-oriented attitude","Cares deeply about user experience, performance, and maintainability"]	\N	https://jobs.ashbyhq.com/openrouter/63265414-7beb-4c2d-ab2a-6b6e80e99703	\N	2025-11-05 00:51:10.831	2025-11-05 00:51:10.833	f	\N	2025-11-15 00:01:43.39	2025-11-15 00:01:43.39
1762445775278-8pe4dx6fd	Sales Engineer	OpenRouter	Remote (US)	As a Sales Engineer, you'll be the technical quarterback for OpenRouter's enterprise sales cycles.	\N	\N	\N	["5+ years as Sales Engineer, Solutions Engineer, or Solutions Architect in B2B SaaS/API/Infrastructure platforms","Strong technical background with hands-on experience in software development, APIs, or cloud infrastructure","Excellent presentation skills with the ability to explain complex technical concepts to varied audiences","Strong problem-solving skills and ability to architect solutions under pressure","Customer-first mindset with genuine desire to help customers succeed"]	\N	https://jobs.ashbyhq.com/openrouter/e91371bc-5df2-4362-b95c-0a8c049e31a4	\N	2025-11-06 16:16:15.279	2025-11-05 00:51:28.892	f	\N	2025-11-15 00:01:43.391	2025-11-15 00:01:43.391
1762443828239-1doo9uqhj	Staff Software Engineer - AI	Rippling	San Francisco, CA, Seattle, WA, New York, NY	Design, develop, code and test backend software systems. Ensure operational excellence and scale our data platform capabilities.	180000	315000	USD	["9+ years of industry experience building software at some (or all) levels of the stack","Experience developing user-facing applications","Experience in the Ads, Personalization, Sales, or similar domain","An interest and/or experience in creating agentic AI and LLM use cases"]	https://ats.rippling.com/rippling/jobs/f5063c49-fe2d-45f7-be58-9e8824f653ce	https://ats.rippling.com/rippling/jobs/f5063c49-fe2d-45f7-be58-9e8824f653ce	\N	2025-11-06 15:43:48.224	2025-11-06 15:43:48.239	f	["ai staff","ai","staff"]	2025-11-15 00:01:43.391	2025-11-15 00:01:43.391
1762444046684-kxzgaj175	Staff Full Stack Software Engineer (Backend) - Employee Experience	Rippling	San Francisco, CA, New York, NY	Drive development and execution of multiple product features for the Employee Experience team, fostering a culture of collaboration, innovation, and excellence.	180000	315000	USD	["8+ years of professional experience as a software engineer","Expertise in building distributed services with Python, Golang, or Java","Experience working in a fast-paced, dynamic environment","React experience required"]	https://ats.rippling.com/rippling/jobs/ddf01a95-481e-46db-aa6d-e76aed5c9d6a	https://ats.rippling.com/rippling/jobs/ddf01a95-481e-46db-aa6d-e76aed5c9d6a	\N	2025-11-06 15:47:26.68	2025-11-06 15:47:26.684	f	["ai","in office","staff"]	2025-11-15 00:01:43.392	2025-11-15 00:01:43.392
1762444077288-wtcchrkv5	Senior Staff Software Engineer - Global Payroll	Rippling	San Francisco, CA	Design and scale the core systems that power global payroll while also owning the end-to-end engineering of mission-critical workflows relied on by hundreds of thousands of employees and administrators.	198000	346500	USD	["10+ years of professional software engineering experience","Strong track record spanning both platform and product engineering"]	Apply now	https://ats.rippling.com/rippling/jobs/631e8120-3e87-4cb2-8083-3bc4324069bd	\N	2025-11-06 15:47:57.283	2025-11-06 15:47:57.288	f	["staff","eor product"]	2025-11-15 00:01:43.393	2025-11-15 00:01:43.393
1762444164193-99j5s3rmq	Senior Staff Software Engineer - Fintech Data Platform	Rippling	San Francisco, CA, New York, NY, Seattle, WA	Define and drive the data architecture strategy for Finance Products, establishing the long-term blueprint for data modeling, data flow, and system integration across Payroll, Tax, Payments, Billing, and related domains.	180000	315000	USD	["10+ years of experience in software or data engineering, with a strong emphasis on data architecture, modeling, and distributed data systems.","Proven ability to design high-integrity financial data systems — including ledgering, reconciliation, and audit frameworks — that operate at global scale.","Deep experience with relational and analytical data modeling, including event-driven and streaming architectures (e.g., Kafka, Debezium, CDC pipelines).","Strong understanding of financial data domains such as payroll, tax, payments, or accounting is highly desirable.","Expertise in SQL and modern data warehousing technologies (e.g., Snowflake, BigQuery, Redshift) as well as data orchestration and transformation tools (e.g., Airflow, dbt).","Ability to balance technical purity with product velocity, iteratively delivering architecture that supports immediate product needs while setting up long-term scale.","Excellent communication and collaboration skills, with a track record of influencing architecture across multiple teams and business functions."]	\N	https://ats.rippling.com/rippling/jobs/d3c8bed0-d988-4765-b8a5-a69dde11b676	\N	2025-11-06 15:49:24.19	2025-11-06 15:49:24.193	f	\N	2025-11-15 00:01:43.393	2025-11-15 00:01:43.393
1762444221986-1ff335n5j	Senior Software Engineer - Streaming Infrastructure	Rippling	New York, NY, San Francisco, CA, Seattle, WA	Build Unified Data Pipelines, Solve Complex Distributed Systems Challenges, Drive Technical Strategy, Scale Performance, Enhance Reliability, Knowledge Sharing, Operational Support	159000	278250	USD	["5+ years of software engineering experience","Solid understanding of stream processing technologies","Experience with distributed systems and database technologies","Proficiency in at least one JVM language or Python","Ability to collaborate effectively"]	https://ats.rippling.com/rippling/jobs/4738d6df-88b4-48b8-b593-9f09ee846103	https://ats.rippling.com/rippling/jobs/4738d6df-88b4-48b8-b593-9f09ee846103	\N	2025-11-06 15:50:21.982	2025-11-06 15:50:21.986	f	\N	2025-11-15 00:01:43.394	2025-11-15 00:01:43.394
1762752352324-gv3t17jjy	Senior Backend Engineer [TypeScript] (Prisma ORM)	Prisma	Product Development  Remote (Berlin, Berlin, DE)  Remote (Munich, Bavaria, DE)  Remote (Frankfurt am Main, Hessen, DE)  Remote (London, England, GB)  Remote (Dublin, County Dublin, IE)  Remote (Glasgow, Scotland, GB)  Remote (Cardiff, Wales, GB)  Remote (Paris, Île-de-France, FR)  Remote (Amsterdam, North Holland, NL)  Remote (Brussels, Brussels, BE)  Remote (Oslo, Oslo, NO)  Remote (Stockholm, Stockholm County, SE)  Remote (Helsinki, Uusimaa, FI)  Remote (Copenhagen, DK)  Remote (Budapest, HU)  Remote (Lisbon, Lisbon, PT)  Remote (Madrid, Community of Madrid, ES)  Remote (Prague, Prague, CZ)  Remote (Rome, Lazio, IT)  Remote (Vienna, Vienna, AT)  Remote (Warsaw, Masovian Voivodeship, PL)  Remote (Zagreb, HR)  Remote (Bucharest, Bucharest, RO)  Remote (Sofia, Sofia City Province, BG)  Remote (Tallinn, Harju County, EE)	Join Prisma... to deliver a market-leading ORM. A typical day at Prisma might include: Expanding the Prisma Client to support advanced database capabilities.	\N	\N	USD	["5+ years of professional experience as a Senior Software Engineer (or equivalent senior-level role) with a proven track record of delivering production-grade systems.","Deep backend engineering expertise with JavaScript and TypeScript, writing clean, maintainable, and scalable codebases.","Strong database proficiency: Hands-on experience with high-scale, data-intensive systems."]	\N	https://ats.rippling.com/prisma-careers/jobs/b7a666d2-b726-4cbb-a5b8-6e5bf60781bb	\N	2025-11-10 05:30:23.895	2025-11-10 05:25:47.159	f	\N	2025-11-15 00:01:43.394	2025-11-15 00:01:43.394
1763167737134-x3br93irp	Senior Staff Engineer, Core Infrastructure	Stripe	["New York","South San Francisco HQ","Seattle","Chicago","Remote in United States"]	Lead the design, planning, construction, and maintenance of Compute, Storage, and Networking systems utilized throughout Stripe. Facilitate technical discussions and decision-making across Core Infrastructure, various Infrastructure teams, and Stripe's platform and product teams.	267000	400400	USD	["BS or MS in Computer Science or a related field","15+ years of professional experience in a software development or DevOps automation role"]	\N	https://stripe.com/jobs/listing/senior-staff-engineer-core-infrastructure/7017350	\N	2025-11-15 00:48:57.105	2025-11-15 00:48:57.139	f	["engineer"]	2025-11-15 00:48:57.14	2025-11-15 00:49:04.361
1763168316524-9y41cu3iq	Community Support Engineer	Cursor	Remote	We're looking for a Community Support Engineer who thrives in solving complex technical challenges and delivering an exceptional user experience.	\N	\N	\N	["Hands-on experience with Cursor as a user","Experience in community forum support, software engineering, or a related user-facing technical role","Strong understanding of software development workflows; experience with IDEs, LLMs, and building with AI","Strong debugging skills and a passion for digging deep into technical problems","Clear, concise communication skills to explain complex concepts to technical and non-technical audiences","Self-starter with curiosity, creativity, and a bias for action"]	/careers/community-support-engineer#apply	https://cursor.com/careers/community-support-engineer	\N	2025-11-15 00:58:36.502	2025-11-15 00:58:36.527	f	[]	2025-11-15 00:58:36.528	2025-11-15 00:58:39.02
1763168320400-5jpkdlg91	GTM Systems	Anysphere (Cursor)	["San Francisco","New York"]	Own and operate tools and processes that power Sales, Marketing, and Partnerships functions.	\N	\N	\N	["5–8 years of experience in GTM Systems, Sales Operations, or Revenue Operations","Strong hands-on expertise with Salesforce administration and GTM tool stacks","Experience building and maintaining workflows, automation, and reporting","Strong understanding of SaaS business models, pipeline management, and GTM metrics","Proficiency with BI/reporting tools (Hex, Retool, or similar) and SQL is a plus","Detail-oriented with strong problem-solving and troubleshooting skills"]	/careers/gtm-systems	https://cursor.com/careers/gtm-systems	\N	2025-11-15 00:58:40.392	2025-11-15 00:58:40.402	f	[]	2025-11-15 00:58:40.403	2025-11-15 00:58:42.149
1763168334371-34k9ftsme	Software Engineer, Product	Cursor	["SF / NY"]	Product engineers create software we ship to our users, in particular our editor. As a member of our core product team, you'll join us in inventing a new, better way to build software.	\N	\N	\N	["You've built a great product.","You blend excellent engineering with a taste for models and design.","You have a propensity for creative ideas and have a knack for making powerful tools without compromising their ease-of-use."]	https://cursor.com/careers/software-engineer-product	https://cursor.com/careers/software-engineer-product	\N	2025-11-15 00:58:54.361	2025-11-15 00:58:54.374	f	[]	2025-11-15 00:58:54.374	2025-11-15 00:58:57.123
1762272938201-je03kini6	Technical Program Manager, AI and ML Software	Nvidia	["Santa Clara, CA","United States"]	Lead initiatives and programs focused on Deep Learning Inference to support NVIDIA's top AI Inference researchers and engineers in driving the future of deep learning.	192000	368000	USD	["Postgraduate degree in Computer Science or Artificial Intelligence or equivalent experience","10+ years program management experience including proven ability managing global projects, adaptable to multiple time zones","Ability to think strategically and tactically and to build consensus to make programs successful","Proven experience to creatively resolve technical issues and resource conflicts","Thorough working knowledge of software engineering best practices and hardware bring-up","You should be detail oriented with shown ability to multitask, in a dynamic environment with shifting priorities and changing requirements"]	\N	https://www.levels.fyi/jobs/company/nvidia?locationSlug=united-states&locationSlugs=new-york-city-area%2Cnew-jersey-usa%2Cprinceton-usa-5%2Cphiladelphia-area&minMedianTotalCompensation=200000&standardLevels=mid_staff%2Cprincipal%2Cmanager%2Cdirector%2Cexecutive&jobId=114459153828586182	a month ago	2025-11-15 01:24:30.35	2025-11-04 16:15:38.201	f	\N	2025-11-15 00:01:43.387	2025-11-15 01:24:30.35
1763494031467-7bw0t4qux	Developer Productivity Engineer	Hightouch	["Remote","North America"]	Take responsibility for our monorepo and the “path to production” for over 50 engineers pushing over 75 commits a day with continuous deployment to production.	180000	320000	USD	["Own the build","Detangle our build/test/deploy patterns","Drive excellence in testing","Multi-Region and Multi-Cloud","Operational excellence"]	\N	https://job-boards.greenhouse.io/hightouch/jobs/5701750004?gh_src=z31ylyrf4us&ref=levels.fyi&utm_source=levels.fyi&t=c34e5ee54us	\N	2025-11-18 19:27:11.453	2025-11-18 19:27:11.469	f	[]	2025-11-18 19:27:11.47	2025-11-18 19:27:13.677
1763494605643-erki9ao6j	Field Engineer	Cursor (Anysphere)	["SF / NY"]	Partner with prospective and strategic enterprise customers, work hand-in-hand with Sales, Product, and Engineering to scope solutions, demonstrate capabilities, and act as a trusted advisor to technical stakeholders.	\N	\N	\N	["Strong communication skills and executive presence","Deep understanding of the software development lifecycle, modern engineering org structures, and developer productivity challenges","Hands-on technical ability — you don’t need to be a full-time engineer, but you should be fluent in technical workflows, AI tooling, and debugging complex environments","Customer-obsessed with a knack for translating technical details into business impact","Experience in Field Engineering, Solutions Architecture, Pre-Sales, or Consulting for enterprise software","Thrives in a startup environment: resourceful, adaptable, and proactive in creating solutions"]	\N	https://cursor.com/careers/field-engineer	\N	2025-11-18 19:43:32.348	2025-11-18 19:36:45.648	f	\N	2025-11-18 19:36:45.649	2025-11-18 19:43:32.349
1763495827896-0bzjr4ci9	Manager, Software Engineering	ServiceTitan	["United States"]	Lead all technical aspects of an engineering team at ServiceTitan.	183400	245400	USD	["Experience with large scale enterprise web/SaaS applications","Expert-level knowledge of Microsoft .NET technology stack (C# / .NET, ASP.NET MVC, Web APIs) and SQL databases (Microsoft SQL Server or any other)","Taking existing monolithic applications to a domain based, service-driven paradigm","Experience with large scale 3rd party integrations","Basic Microsoft Windows administration skills including IIS administration","Performance / reliability monitoring tools (e.g. New Relic, DataDog, Application Insights)","Log / Metric collection and analysis tools (e.g. Elasticsearch-Logstash-Kibana, DataDog, Interana)","Git, unit testing, debugging, profiling, Visual Studio, JIRA and other tools that are typically used by developers on Microsoft technology stack","Continuous integration and continuous delivery methodologies and tools (TeamCity or similar)","Administration and building automation for Azure, AWS or other public cloud technology","Ability to empathize with our users and champion their experience.","Strong communication and technical writing skills","B.S., M.S. or PhD in Computer Science, Physics, Engineering or a related technical field."]	\N	https://www.levels.fyi/jobs/location/new-york-city-area?locationSlug=united-states&offset=10&searchText=software+engineering+manager&jobId=137599587618562758	17 days ago	2025-11-18 19:57:07.871	2025-11-18 19:57:07.9	f	[]	2025-11-18 19:57:07.901	2025-11-18 19:57:11.856
1763497327472-lsowkmte8	Enterprise Solutions Engineer	ElevenLabs	["Remote","San Francisco"]	Work as part of a driven team to unlock the full potential of our voice AI platform for a growing customer base.	\N	\N	\N	["Are passionate about AI, technology and ElevenLabs products.","Enjoy working directly with customers, iterating on solutions and providing tailored support","Have a talent for identifying patterns that can be standardized and scaled.","Have strong empathy for customers, sales and product teams.","Have a strong technical background in order to help customers architect integration between our solutions and their existing solutions"]	\N	https://elevenlabs.io/careers/275f43d0-b62d-401d-830c-7c1ac0e688aa/enterprise-solutions-engineer?ashby_jid=275f43d0-b62d-401d-830c-7c1ac0e688aa	\N	2025-11-18 20:22:07.45	2025-11-18 20:22:07.475	f	[]	2025-11-18 20:22:07.476	2025-11-18 20:22:09.418
1763502202411-vbcbq31n0	Backend Engineer (Affiliated Trading)	Kalshi	["New York","Remote"]	Building and maintaining infrastructure underlying trading operations.	150000	250000	USD	["At least 3 years of professional experience as a backend engineer","Experience building robust high performance event-driven systems and APIs","Very comfortable with relational databases (e.g. Postgres)","Experience writing concurrent code","Familiarity with the AWS stack (especially RDS and ECS)","Familiarity with stream processing (Kafka)"]	\N	https://job-boards.greenhouse.io/kalshi/jobs/7450381003	\N	2025-11-18 21:43:22.39	2025-11-18 21:43:22.414	f	[]	2025-11-18 21:43:22.415	2025-11-18 21:43:24.178
1763502972267-74rv0yqfn	Staff Software Engineer, Prediction Markets	Robinhood	["New York, NY"]	Join us in building the future of finance.	217000	255000	USD	["10+ years of experience building large-scale distributed systems in production","Deep expertise in backend programming (e.g., Python, Go, Java) and cloud-native architecture","Strong system design and software engineering fundamentals","Experience leading cross-functional technical initiatives and mentoring engineers","Ability to simplify complex problems and communicate technical solutions clearly"]	\N	https://job-boards.greenhouse.io/robinhood/jobs/7340788?t=gh_src=&gh_jid=7340788&gh_src=NaN	\N	2025-11-18 21:56:12.243	2025-11-18 21:56:12.331	f	[]	2025-11-18 21:56:12.332	2025-11-18 21:56:14.18
1763503457930-51mouu6qj	Senior Software Engineer, Frontend and AI	MongoDB	["New York City"]	Design, build, and optimize web applications in React, GraphQL, and TypeScript, focusing on performance and user experience. Lead development on Spruce and Parsley, delivering data-rich, highly interactive experiences that scale to massive CI workloads.	118000	231000	USD	["5+ years of strong experience in React and TypeScript","Experience working with backend systems (experience in a statically typed compiled language like Go is a plus)","Interest in developing agentic services and working with AI-powered developer tooling","Track record of designing and implementing performant, large-scale web apps","Familiarity with end-to-end testing frameworks such as Cypress or playwright","Strong fundamentals in software engineering, including algorithms, data structures, and systems design"]	\N	https://www.mongodb.com/careers/jobs/7304325	\N	2025-11-18 22:04:17.908	2025-11-18 22:04:17.997	f	[]	2025-11-18 22:04:17.998	2025-11-18 22:04:20.043
1763507715031-ojne07et1	Demo Engineer	Stripe	["South San Francisco HQ","Atlanta","New York","Seattle","Chicago","Remote in United States"]	Build on-stage product demos for our annual user conference and global event series.	187500	281300	USD	["5+ years in software engineering (or equivalent).","Experience in demo engineering, solutions architecture, sales engineering, or developer relations is a plus.","Payments/fintech, AV/show production familiarity, and hardware/POS experience are nice to have."]	\N	https://stripe.com/jobs/listing/demo-engineer/7390314	\N	2025-11-18 23:15:15.008	2025-11-18 23:15:15.083	f	[]	2025-11-18 23:15:15.083	2025-11-18 23:15:16.755
1763508517761-ctaig8pwf	Senior Software Engineer, Distributed Backend	Roku	["New York","United States"]	Work alongside a highly skilled engineering team to design, develop, and maintain large-scale, highly performing, real-time applications Own building features, driving directly with the product, and other engineering teams Demonstrate excellent communication skills in working with technical and non-technical audiences Be an evangelist for best practices across all functions – developers, QA, and infrastructure/ops Be an evangelist for platform innovation and reuse Deliver top-quality software in a timely fashion	186000	360000	\N	["10+ years of experience building large-scale and low-latency distributed systems","Command of Java or C++","Solid understanding of algorithms, data structures, performance optimization techniques, object-oriented programming, multi-threading, and real-time programming","Experience with distributed caching, SQL/NoSQL, and other databases is a plus","Experience with Big Data and cloud services such as AWS/GCP is a plus","Experience in the advertising domain is a big plus","B.S. or M.S. degree in Computer Science, Engineering, or equivalent","Self-motivated individual with a high level of accountability and ownership","Critical thinking and practical decision-making","Can do, results-oriented mindset","Nonpolitical, collaborative, and team-oriented","Desire to win in a highly competitive industry","AI literacy and curiosity"]	\N	https://www.weareroku.com/jobs/senior-software-engineer-distributed-backend-new-york-united-states-35fd912c-43bb-4667-8225-8dfca7be6197	\N	2025-11-18 23:28:37.741	2025-11-18 23:28:37.824	f	[]	2025-11-18 23:28:37.825	2025-11-18 23:28:39.812
\.


--
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile (id, linkedin_url, resume_data, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: applications_job_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX applications_job_id_idx ON public.applications USING btree (job_id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

