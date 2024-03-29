--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

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

ALTER TABLE ONLY public."UsersJokes" DROP CONSTRAINT user_id;
ALTER TABLE ONLY public."JokesTags" DROP CONSTRAINT tag_id;
ALTER TABLE ONLY public."JokesTags" DROP CONSTRAINT joke_id;
ALTER TABLE ONLY public."UsersJokes" DROP CONSTRAINT joke_id;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
ALTER TABLE ONLY public."Tag" DROP CONSTRAINT "Tag_pkey";
ALTER TABLE ONLY public."Tag" DROP CONSTRAINT "Tag_name_unique";
ALTER TABLE ONLY public."Joke" DROP CONSTRAINT "Joke_pkey";
ALTER TABLE public."User" ALTER COLUMN uid DROP DEFAULT;
ALTER TABLE public."Tag" ALTER COLUMN tid DROP DEFAULT;
ALTER TABLE public."Joke" ALTER COLUMN jid DROP DEFAULT;
DROP TABLE public."UsersJokes";
DROP SEQUENCE public."User_uid_seq";
DROP TABLE public."User";
DROP SEQUENCE public."Tag_tid_seq";
DROP TABLE public."Tag";
DROP TABLE public."JokesTags";
DROP SEQUENCE public."Joke_jid_seq";
DROP TABLE public."Joke";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Joke; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Joke" (
    jid integer NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    content character varying(2048) NOT NULL,
    title character varying(64) NOT NULL
);


ALTER TABLE public."Joke" OWNER TO postgres;

--
-- Name: Joke_jid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Joke_jid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Joke_jid_seq" OWNER TO postgres;

--
-- Name: Joke_jid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Joke_jid_seq" OWNED BY public."Joke".jid;


--
-- Name: JokesTags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."JokesTags" (
    jid integer NOT NULL,
    tid integer NOT NULL
);


ALTER TABLE public."JokesTags" OWNER TO postgres;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tag" (
    tid integer NOT NULL,
    name character varying(32) NOT NULL
);


ALTER TABLE public."Tag" OWNER TO postgres;

--
-- Name: Tag_tid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tag_tid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tag_tid_seq" OWNER TO postgres;

--
-- Name: Tag_tid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tag_tid_seq" OWNED BY public."Tag".tid;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    uid integer NOT NULL,
    username character varying(32) NOT NULL,
    email character varying(254) NOT NULL,
    password character(64) NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_uid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_uid_seq" OWNER TO postgres;

--
-- Name: User_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_uid_seq" OWNED BY public."User".uid;


--
-- Name: UsersJokes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UsersJokes" (
    uid integer NOT NULL,
    jid integer NOT NULL,
    "isLiked" boolean NOT NULL
);


ALTER TABLE public."UsersJokes" OWNER TO postgres;

--
-- Name: Joke jid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Joke" ALTER COLUMN jid SET DEFAULT nextval('public."Joke_jid_seq"'::regclass);


--
-- Name: Tag tid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag" ALTER COLUMN tid SET DEFAULT nextval('public."Tag_tid_seq"'::regclass);


--
-- Name: User uid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN uid SET DEFAULT nextval('public."User_uid_seq"'::regclass);


--
-- Name: Joke Joke_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Joke"
    ADD CONSTRAINT "Joke_pkey" PRIMARY KEY (jid);


--
-- Name: Tag Tag_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_name_unique" UNIQUE (name);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (tid);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (uid);


--
-- Name: UsersJokes joke_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UsersJokes"
    ADD CONSTRAINT joke_id FOREIGN KEY (jid) REFERENCES public."Joke"(jid) NOT VALID;


--
-- Name: JokesTags joke_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JokesTags"
    ADD CONSTRAINT joke_id FOREIGN KEY (jid) REFERENCES public."Joke"(jid);


--
-- Name: JokesTags tag_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JokesTags"
    ADD CONSTRAINT tag_id FOREIGN KEY (tid) REFERENCES public."Tag"(tid);


--
-- Name: UsersJokes user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UsersJokes"
    ADD CONSTRAINT user_id FOREIGN KEY (uid) REFERENCES public."User"(uid);


--
-- PostgreSQL database dump complete
--

