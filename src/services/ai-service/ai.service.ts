import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { aiTools, allowedToolsForRole } from "./ai.tools";

export const aiService = {
  tools: (role: string) => allowedToolsForRole(role),
  async ask(userId: string, role: string, data: { message: string; tool?: string }) {
    if (data.tool) {
      const tool = aiTools.find((item) => item.name === data.tool);
      if (!tool || !(tool.roles as readonly string[]).includes(role)) throw new ApiError(403, "AI tool not allowed for this role");
    }
    const conversation = await prisma.aiConversation.upsert({ where: { userId }, update: {}, create: { userId } });
    await prisma.aiMessage.create({ data: { conversationId: conversation.id, role: "USER", content: data.message } });
    const content = data.tool ? `AI tool ${data.tool} executed with role-aware permissions.` : "Шинж тэмдэг, эмч хайлт, цаг захиалга эсвэл шинжилгээний хариуны талаар тодруулж асуугаарай.";
    const assistant = await prisma.aiMessage.create({ data: { conversationId: conversation.id, role: "ASSISTANT", content, toolName: data.tool } });
    return { answer: assistant.content, tools: allowedToolsForRole(role) };
  },
};

