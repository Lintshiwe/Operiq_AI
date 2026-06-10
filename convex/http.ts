/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

export default http;