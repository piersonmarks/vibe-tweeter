import useSWR from "swr";

const fetcher = (url: string) => fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
}).then((res) => res.json());

export function useSuggestions() {
  const { data, error, isLoading } = useSWR(`/api/v1/generate-suggestions`, fetcher)

  return {
    data,
    isLoading,
    isError: error
  }
}