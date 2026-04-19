import proyecto from "./api/Proyecto";

export const listConversations = async (status = "open") => {
  const { data } = await proyecto.get("/support/conversations", {
    params: { status },
  });
  return data;
};

export const getConversationMessages = async (conversationId) => {
  const { data } = await proyecto.get(
    `/support/conversations/${conversationId}/messages`
  );
  return data;
};

export const claimConversation = async (conversationId) => {
  const { data } = await proyecto.post(
    `/support/conversations/${conversationId}/claim`
  );
  return data;
};

export const closeConversation = async (conversationId) => {
  const { data } = await proyecto.post(
    `/support/conversations/${conversationId}/close`
  );
  return data;
};

export const sendConversationMessage = async (conversationId, body) => {
  const { data } = await proyecto.post(
    `/support/conversations/${conversationId}/messages`,
    { body }
  );
  return data;
};

