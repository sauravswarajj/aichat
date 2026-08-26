import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { threadService } from "@/services/thread.service";
import { Thread, ThreadSummary } from "@/types/api.types";

export const THREADS_QUERY_KEY = ["threads"];
export const threadDetailQueryKey = (id: string) => ["threads", id];

export function useThreadsQuery() {
  return useQuery<ThreadSummary[]>({
    queryKey: THREADS_QUERY_KEY,
    queryFn: () => threadService.list(),
  });
}

export function useThreadQuery(id: string | undefined) {
  return useQuery<Thread>({
    queryKey: threadDetailQueryKey(id ?? ""),
    queryFn: () => threadService.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => threadService.create(title),
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
      queryClient.setQueryData(threadDetailQueryKey(newThread.id), newThread);
    },
  });
}

export function useRenameThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => threadService.rename(id, title),
    onSuccess: (updatedThread) => {
      queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
      queryClient.setQueryData(threadDetailQueryKey(updatedThread.id), updatedThread);
    },
  });
}

export function useDeleteThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => threadService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: threadDetailQueryKey(deletedId) });
    },
  });
}
