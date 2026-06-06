import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import vendorsRouter from "./vendors";
import rfqsRouter from "./rfqs";
import quotationsRouter from "./quotations";
import approvalsRouter from "./approvals";
import purchaseOrdersRouter from "./purchase-orders";
import invoicesRouter from "./invoices";
import activityLogsRouter from "./activity-logs";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import analyticsRouter from "./analytics";
import uploadRouter from "./upload";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(usersRouter);
router.use(vendorsRouter);
router.use(rfqsRouter);
router.use(quotationsRouter);
router.use(approvalsRouter);
router.use(purchaseOrdersRouter);
router.use(invoicesRouter);
router.use(activityLogsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(uploadRouter);
router.use(analyticsRouter);

export default router;
