import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { trackServerEvent } from "@/lib/posthog";

export async function GET(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      await trackServerEvent("card_logs_view_unauthorized", {
        cardId: params.cardId,
        orgId,
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId,
        entityId: params.cardId,
        entityType: ENTITY_TYPE.CARD,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    await trackServerEvent(
      "card_logs_viewed",
      {
        cardId: params.cardId,
        orgId,
        logCount: auditLogs.length,
      },
      userId
    );

    return NextResponse.json(auditLogs);
  } catch (error) {
    await trackServerEvent("card_logs_view_error", {
      cardId: params.cardId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
