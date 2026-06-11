from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User, Users
from diagrams.programming.language import Javascript, NodeJS
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.compute import Rack
from diagrams.generic.storage import Storage
from diagrams.generic.network import Firewall
from diagrams.aws.compute import Lambda
from diagrams.onprem.network import Nginx

graph_attr = {
    "fontsize": "22",
    "bgcolor": "#faf9f5",
    "splines": "spline",
    "pad": "1.0",
    "nodesep": "0.9",
    "ranksep": "1.3",
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
    "Operiq AI — Data Flow",
    filename="operiq-data-flow",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    outformat="png",
):
    user_input = User("User Input")
    client_validation = Javascript("Client Validation")

    with Cluster("Convex Backend"):
        convex_mutation = PostgreSQL("Convex Mutation")
        realtime = Nginx("WebSocket")

    with Cluster("AI Pipeline"):
        prompt_engineering = Rack("Prompt Engineering")
        model_routing = Rack("Model Router")
        ai_provider = Rack("AI Provider")
        generation = Lambda("Generation")
        post_process = Rack("Post Processing")

    response = Storage("Response")
    render = NodeJS("SSR Render")
    ui = Users("Rendered UI")

    user_input >> Edge(label="text/voice/image") >> client_validation
    client_validation >> Edge(label="validated input") >> convex_mutation
    convex_mutation >> Edge(label="invoke tool") >> prompt_engineering
    prompt_engineering >> Edge(label="system + context") >> model_routing
    model_routing >> Edge(label="select model") >> ai_provider
    ai_provider >> Edge(label="API call") >> generation
    generation >> Edge(label="raw output") >> post_process
    post_process >> Edge(label="cleaned result") >> response
    response >> Edge(label="stream/chunks") >> render
    render >> Edge(label="HTML/SSR") >> ui

    convex_mutation >> Edge(label="real-time sync", color="#5db8a6", style="dashed") >> realtime
    realtime >> Edge(label="push updates", color="#5db8a6", style="dashed") >> ui

print("Saved: operiq-data-flow.png")
