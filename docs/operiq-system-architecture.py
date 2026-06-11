from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.aws.network import CloudFront
from diagrams.aws.compute import Lambda
from diagrams.programming.language import Javascript, Typescript, NodeJS
from diagrams.onprem.database import PostgreSQL
from diagrams.aws.security import Cognito
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.generic.network import Router
from diagrams.saas.cdn import Cloudflare
from diagrams.onprem.network import Nginx

graph_attr = {
    "fontsize": "24",
    "bgcolor": "#faf9f5",
    "splines": "spline",
    "pad": "1.0",
    "nodesep": "0.9",
    "ranksep": "1.3",
}

node_attr = {
    "fontsize": "13",
    "fontcolor": "#141413",
    "penwidth": "2.5",
    "style": "filled",
    "fillcolor": "#efe9de",
}

edge_attr = {
    "color": "#cc785c",
    "fontcolor": "#6c6a64",
    "fontsize": "10",
    "penwidth": "1.5",
}

with Diagram(
    "Operiq AI — System Architecture",
    filename="operiq-system-architecture",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    outformat="png",
):
    user = User("User / Browser")

    with Cluster("Netlify Edge Layer"):
        netlify_cdn = CloudFront("Netlify CDN")
        edge_fn = Lambda("Edge Functions")

    with Cluster("TanStack Start (SSR)"):
        ssr = NodeJS("TanStack Start")
        with Cluster("Frontend"):
            react = Javascript("React 19")
            router = Typescript("TanStack Router")
            tailwind = Nginx("Tailwind CSS v4")

    with Cluster("Convex Cloud"):
        with Cluster("Database"):
            convex_db = PostgreSQL("Convex DB")
        with Cluster("Auth"):
            convex_auth = Cognito("Convex Auth")
        with Cluster("Files"):
            convex_files = Storage("File Storage")

    with Cluster("AI Providers"):
        with Cluster("LLM Gateway"):
            openai = Rack("OpenAI Compatible")
            gpt4o = Rack("GPT-4o")
            claude = Rack("Claude")
        with Cluster("Media AI"):
            hf = Rack("Hugging Face")
            flux = Rack("FLUX")
            hunyuan = Rack("HunyuanVideo")
        with Cluster("Voice AI"):
            elevenlabs = Rack("ElevenLabs")
            tts = Rack("TTS")
            stt = Rack("STT")

    with Cluster("External Services"):
        resend = Rack("Resend (Email)")
        duckduckgo = Rack("DuckDuckGo")

    user >> Edge(label="HTTPS") >> netlify_cdn
    netlify_cdn >> Edge(label="route") >> edge_fn
    edge_fn >> Edge(label="proxy") >> ssr
    ssr >> Edge(label="fetch") >> react
    react >> router
    router >> tailwind

    ssr >> Edge(label="queries", color="#5db8a6") >> convex_db
    ssr >> Edge(label="auth", color="#5db8a6") >> convex_auth
    ssr >> Edge(label="storage", color="#5db8a6") >> convex_files

    convex_db >> Edge(label="data") >> ssr
    convex_auth >> Edge(label="session") >> ssr

    ssr >> Edge(label="chat/code", color="#cc785c", style="bold") >> openai
    openai >> gpt4o
    openai >> claude
    ssr >> Edge(label="image/video", color="#e8a55a") >> hf
    hf >> flux
    hf >> hunyuan
    ssr >> Edge(label="voice", color="#5db8a6") >> elevenlabs
    elevenlabs >> tts
    elevenlabs >> stt

    ssr >> Edge(label="send", color="#6c6a64", style="dashed") >> resend
    ssr >> Edge(label="search", color="#6c6a64", style="dashed") >> duckduckgo

print("Saved: operiq-system-architecture.png")
