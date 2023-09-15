import { useMutation } from '@tanstack/react-query';

export const useFetchOEmbed = () =>
  useMutation({
    mutationKey: ['oembed-query'],
    mutationFn: async (URL: string) => {
      const { link, meta } = await (await fetch(`/api/link?url=${URL}`)).json();

      return { link, meta };
    },
  });
