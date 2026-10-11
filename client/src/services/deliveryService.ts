import { graphqlApi } from './graphqlApi';

export type DeliveryRoute = {
  id: string;
  volunteer_id: string;
  origin_location: string;
  destination_location: string;
  travel_date: string;
  capacity: number;
  is_active: boolean;
};

export type DeliveryRelay = {
  id: string;
  route_id: string;
  location: string;
  sequence: number;
};

export type DeliveryLeg = {
  id: string;
  delivery_id: string;
  route_id: string;
  volunteer_id: string;
  sequence: number;
  status: string;
};

export type DeliveryRecord = {
  id: string;
  book_id: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  route_id: string | null;
  volunteer_id: string | null;
  created_at: string;
  completed_at: string | null;
};

export type DeliveryTrackingEvent = {
  id: string;
  status: string;
  location: string | null;
  note: string | null;
  created_at: string;
};

export type VolunteerRoute = {
  route: DeliveryRoute;
  relays: DeliveryRelay[];
};

export type VolunteerAssignment = {
  delivery: DeliveryRecord;
  events: DeliveryTrackingEvent[];
  relays: DeliveryRelay[];
  legs: DeliveryLeg[];
  routes: DeliveryRoute[];
};

const ROUTE_FIELDS = `
  id volunteer_id origin_location destination_location travel_date capacity is_active
`;

const DELIVERY_RESULT_FIELDS = `
  delivery {
    id book_id pickup_location delivery_location status route_id volunteer_id
    created_at completed_at
  }
  events { id status location note created_at }
  relays { id route_id location sequence }
  legs { id delivery_id route_id volunteer_id sequence status }
  routes { ${ROUTE_FIELDS} }
`;

export const deliveryApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getVolunteerRoutes: builder.query<VolunteerRoute[], void>({
      query: () => ({
        document: `
          query VolunteerRoutes {
            getVolunteerRoutes {
              route { ${ROUTE_FIELDS} }
              relays { id route_id location sequence }
            }
          }
        `,
      }),
      transformResponse: (response: { getVolunteerRoutes: VolunteerRoute[] }) =>
        response.getVolunteerRoutes,
      providesTags: ['VolunteerRoutes'],
    }),
    getVolunteerAssignments: builder.query<VolunteerAssignment[], void>({
      query: () => ({
        document: `
          query VolunteerAssignments {
            getVolunteerAssignments { ${DELIVERY_RESULT_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: {
        getVolunteerAssignments: VolunteerAssignment[];
      }) => response.getVolunteerAssignments,
      providesTags: ['VolunteerAssignments'],
    }),
    createVolunteerRoute: builder.mutation<
      DeliveryRoute,
      {
        originLocation: string;
        destinationLocation: string;
        travelDate: string;
        capacity: number;
      }
    >({
      query: (variables) => ({
        document: `
          mutation CreateVolunteerRoute(
            $originLocation: String!
            $destinationLocation: String!
            $travelDate: DateTime!
            $capacity: Int!
          ) {
            createRoute(
              originLocation: $originLocation
              destinationLocation: $destinationLocation
              travelDate: $travelDate
              capacity: $capacity
            ) { ${ROUTE_FIELDS} }
          }
        `,
        variables,
      }),
      transformResponse: (response: { createRoute: DeliveryRoute }) =>
        response.createRoute,
      invalidatesTags: ['VolunteerRoutes'],
    }),
    createVolunteerRelay: builder.mutation<
      DeliveryRelay,
      { routeId: string; location: string; sequence: number }
    >({
      query: (variables) => ({
        document: `
          mutation CreateVolunteerRelay(
            $routeId: String!
            $location: String!
            $sequence: Int!
          ) {
            createRelay(
              routeId: $routeId
              location: $location
              sequence: $sequence
            ) { id route_id location sequence }
          }
        `,
        variables,
      }),
      transformResponse: (response: { createRelay: DeliveryRelay }) =>
        response.createRelay,
      invalidatesTags: ['VolunteerRoutes'],
    }),
    acceptVolunteerAssignment: builder.mutation<{ id: string }, string>({
      query: (deliveryId) => ({
        document: `
          mutation AcceptVolunteerAssignment($deliveryId: String!) {
            acceptAssignment(deliveryId: $deliveryId) { id }
          }
        `,
        variables: { deliveryId },
      }),
      transformResponse: (response: { acceptAssignment: { id: string } }) =>
        response.acceptAssignment,
      invalidatesTags: ['VolunteerAssignments'],
    }),
    rejectVolunteerAssignment: builder.mutation<{ id: string }, string>({
      query: (deliveryId) => ({
        document: `
          mutation RejectVolunteerAssignment($deliveryId: String!) {
            rejectAssignment(deliveryId: $deliveryId) { id }
          }
        `,
        variables: { deliveryId },
      }),
      transformResponse: (response: { rejectAssignment: { id: string } }) =>
        response.rejectAssignment,
      invalidatesTags: ['VolunteerAssignments'],
    }),
    updateVolunteerDeliveryStatus: builder.mutation<
      { id: string; status: string },
      { deliveryId: string; status: 'IN_TRANSIT' | 'AT_RELAY'; location?: string }
    >({
      query: (variables) => ({
        document: `
          mutation UpdateVolunteerDeliveryStatus(
            $deliveryId: String!
            $status: DeliveryStatus!
            $location: String
          ) {
            updateStatus(
              deliveryId: $deliveryId
              status: $status
              location: $location
            ) { id status }
          }
        `,
        variables,
      }),
      transformResponse: (response: {
        updateStatus: { id: string; status: string };
      }) => response.updateStatus,
      invalidatesTags: ['VolunteerAssignments'],
    }),
    completeVolunteerDeliveryLeg: builder.mutation<{ id: string }, string>({
      query: (deliveryId) => ({
        document: `
          mutation CompleteVolunteerDeliveryLeg($deliveryId: String!) {
            completeDelivery(deliveryId: $deliveryId) { id }
          }
        `,
        variables: { deliveryId },
      }),
      transformResponse: (response: { completeDelivery: { id: string } }) =>
        response.completeDelivery,
      invalidatesTags: ['VolunteerAssignments'],
    }),
  }),
});

export const {
  useGetVolunteerRoutesQuery,
  useGetVolunteerAssignmentsQuery,
  useCreateVolunteerRouteMutation,
  useCreateVolunteerRelayMutation,
  useAcceptVolunteerAssignmentMutation,
  useRejectVolunteerAssignmentMutation,
  useUpdateVolunteerDeliveryStatusMutation,
  useCompleteVolunteerDeliveryLegMutation,
} = deliveryApi;
