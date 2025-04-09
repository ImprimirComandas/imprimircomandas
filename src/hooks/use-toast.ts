import * as React from "react"

import type { ToastActionElement, ToastProps } from "../components/ui/toast"

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastStateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      {
        const { toastId } = action
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        }
      }
    case actionTypes.REMOVE_TOAST:
      {
        const { toastId } = action
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }
  }
}

const update = (toast: Partial<ToasterToast>) => {
  dispatch({ type: actionTypes.UPDATE_TOAST, toast })
}

const dismiss = (toastId?: string) => {
  dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
}

const remove = (toastId?: string) => {
  dispatch({ type: actionTypes.REMOVE_TOAST, toastId })
}

type Toast = Omit<ToasterToast, "id">

const createToast = ({ ...props }: Toast): ToasterToast => {
  const id = crypto.randomUUID()
  toast({ id, ...props })
  return { id, ...props }
}

const toast = (props: ToastProps) => {
  const id = props.id || crypto.randomUUID()

  const update = (props: Partial<ToastProps>) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    update,
    dismiss,
  }
}

let count = 0

const listeners: Array<React.Dispatch<Action>> = []

let memoryState: State = { toasts: [] }

function reducer(state: State, action: Action): State {
  memoryState = toastStateReducer(state, action)
  listeners.forEach((listener) => {
    listener(action)
  })
  return memoryState
}

export function useToast() {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    listeners.push(dispatch)
    return () => {
      const index = listeners.indexOf(dispatch)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [dispatch])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { toast }
