import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { trackServerEvent } from "@/lib/posthog";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      await trackServerEvent("card_view_unauthorized", {
        cardId: params.cardId,
        orgId,
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await db.card.findUnique({
      where: {
        id: params.cardId,
        list: {
          board: {
            orgId,
          },
        },
      },
      include: {
        list: {
          select: {
            title: true,
          },
        },
      },
    });

    await trackServerEvent(
      "card_viewed",
      {
        cardId: params.cardId,
        orgId,
        listTitle: card?.list.title,
      },
      userId
    );

    return NextResponse.json(card);
  } catch (error) {
    await trackServerEvent("card_view_error", {
      cardId: params.cardId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
