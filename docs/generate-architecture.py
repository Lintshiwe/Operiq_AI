"""Generate Operiq AI system architecture diagram using the `diagrams` library."""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User, Client
from diagrams.onprem.compute import Server
from diagrams.saas.identity import Okta
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.generic.network import Firewall
from diagrams.programming.language import Javascript

graph_attr = {
    "fontsize": "22",
    "bgcolor": "#faf9f5",
    "splines": "spline",
    "nodesep": "0.8",
    "ranksep": "1.2",
    "pad": "1.0",
}
node_attr = {
    "fontsize": "12",
    "fontcolor": "#141413",
    "penwidth": "2.5",
    "style": "filled",
    "fillcolor": "#efe9de",
}
edge_attr = {
    "color": "#cc785c",
    "fontcolor": "#6c6a64",
    "fontsize": "9",
    "penwidth": "1.5",
}

with Diagram(
    "Operiq AI — System Architecture",
    filename="operiq-architecture",
    outformat="png",
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    show=False,
):
    # ── Layer 1: Client ──
    user = User("Web Browser")
    mobile = Client("Mobile App")

    # ── Layer 2: Frontend ──
    with Cluster("Frontend"):
        frontend = Javascript("TanStack Start / React 19")

    # ── Layer 3: API Gateway ──
    with Cluster("API Gateway"):
        functions = Server("Netlify Functions")
        auth = Okta("Convex Auth")

    # ── Layer 4: AI Agent ──
    with Cluster("AI Agent"):
        agent_loop = Rack("Agent Loop")
        tools = SQL("Tools: Web Search, URL Fetch")

    # ── Layer 5: Data Layer ──
    with Cluster("Data Layer"):
        database = SQL("Convex Database")
        store = Storage("Threads, Users, SharedChats")

    # ── Layer 6: External Services ──
    with Cluster("External Services"):
        nvidia = Firewall("NVIDIA AI API")
        duckduckgo = Firewall("DuckDuckGo Search")
        huggingface = Firewall("HuggingFace")

    # ── Primary flow edges ──
    user >> frontend >> functions >> auth
    auth >> agent_loop >> database

    # ── Dashed edges to/from External Services ──
    agent_loop >> Edge(style="dashed", label="calls") >> nvidia
    agent_loop >> Edge(style="dashed", label="calls") >> duckduckgo
    agent_loop >> Edge(style="dashed", label="calls") >> huggingface

    nvidia >> Edge(style="dashed", label="response") >> agent_loop
    duckduckgo >> Edge(style="dashed", label="response") >> agent_loop
    huggingface >> Edge(style="dashed", label="response") >> agent_loop
