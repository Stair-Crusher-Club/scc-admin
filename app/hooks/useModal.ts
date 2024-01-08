import { createModalHook } from "@reactleaf/modal"

import register from "@/modals/register"

export const useModal = createModalHook<typeof register>()
