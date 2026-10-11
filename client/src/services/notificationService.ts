import { graphqlApi } from './graphqlApi';

export type UserNotification = {
  id: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
};

export const notificationApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<UserNotification[], void>({
      query: () => ({
        document: `
          query Notifications {
            myNotifications { id message type status created_at }
          }
        `,
      }),
      transformResponse: (response: { myNotifications: UserNotification[] }) =>
        response.myNotifications,
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<UserNotification, string>({
      query: (notificationId) => ({
        document: `
          mutation MarkNotificationRead($notificationId: String!) {
            markAsRead(notificationId: $notificationId) {
              id message type status created_at
            }
          }
        `,
        variables: { notificationId },
      }),
      transformResponse: (response: { markAsRead: UserNotification }) =>
        response.markAsRead,
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<boolean, void>({
      query: () => ({
        document: `
          mutation MarkAllNotificationsRead {
            markAllAsRead
          }
        `,
      }),
      transformResponse: (response: { markAllAsRead: boolean }) =>
        response.markAllAsRead,
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
