/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/assistant")({
  component: () => <Outlet />,
});