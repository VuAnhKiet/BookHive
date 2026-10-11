import { FormEvent, useState } from 'react';
import { getApiErrorMessage } from '../../utils/apiError';
import { useGetUserProfileQuery } from '../../services/profileService';
import {
  VolunteerAssignment,
  useAcceptVolunteerAssignmentMutation,
  useCompleteVolunteerDeliveryLegMutation,
  useCreateVolunteerRelayMutation,
  useCreateVolunteerRouteMutation,
  useGetVolunteerAssignmentsQuery,
  useGetVolunteerRoutesQuery,
  useRejectVolunteerAssignmentMutation,
  useUpdateVolunteerDeliveryStatusMutation,
} from '../../services/deliveryService';

function statusLabel(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase();
}

function VolunteerDashboard() {
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [relayLocation, setRelayLocation] = useState('');
  const [relaySequence, setRelaySequence] = useState('1');
  const [relayLocations, setRelayLocations] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const { data: profile, isLoading: isProfileLoading, error: profileError } =
    useGetUserProfileQuery();
  const {
    data: volunteerRoutes = [],
    isLoading: areRoutesLoading,
    error: routesError,
  } = useGetVolunteerRoutesQuery();
  const {
    data: assignments = [],
    isLoading: areAssignmentsLoading,
    error: assignmentsError,
  } = useGetVolunteerAssignmentsQuery();

  const [createRoute, { isLoading: isCreatingRoute }] =
    useCreateVolunteerRouteMutation();
  const [createRelay, { isLoading: isCreatingRelay }] =
    useCreateVolunteerRelayMutation();
  const [acceptAssignment, { isLoading: isAccepting }] =
    useAcceptVolunteerAssignmentMutation();
  const [rejectAssignment, { isLoading: isRejecting }] =
    useRejectVolunteerAssignmentMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateVolunteerDeliveryStatusMutation();
  const [completeDelivery, { isLoading: isCompleting }] =
    useCompleteVolunteerDeliveryLegMutation();

  const isLoading = isProfileLoading || areRoutesLoading || areAssignmentsLoading;
  const isBusy =
    isCreatingRoute ||
    isCreatingRelay ||
    isAccepting ||
    isRejecting ||
    isUpdatingStatus ||
    isCompleting;

  async function handleCreateRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setNotice('');

    try {
      const route = await createRoute({
        originLocation,
        destinationLocation,
        travelDate: new Date(`${travelDate}T12:00:00.000Z`).toISOString(),
        capacity: Number(capacity),
      }).unwrap();
      setSelectedRouteId(route.id);
      setOriginLocation('');
      setDestinationLocation('');
      setTravelDate('');
      setCapacity('1');
      setNotice('Your journey route is published and available for delivery matching.');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not publish this route.'));
    }
  }

  async function handleAddRelay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRouteId) {
      setFormError('Choose one of your routes before adding a relay stop.');
      return;
    }
    setFormError('');
    setNotice('');

    try {
      await createRelay({
        routeId: selectedRouteId,
        location: relayLocation,
        sequence: Number(relaySequence),
      }).unwrap();
      setRelayLocation('');
      setRelaySequence(String(Number(relaySequence) + 1));
      setNotice('Relay stop added to the route.');
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not add this relay stop.'));
    }
  }

  function selectRoute(routeId: string) {
    setSelectedRouteId(routeId);
    const route = volunteerRoutes.find(({ route: candidate }) => candidate.id === routeId);
    const nextSequence = route
      ? Math.max(0, ...route.relays.map(({ sequence }) => sequence)) + 1
      : 1;
    setRelaySequence(String(nextSequence));
  }

  async function runDeliveryAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setFormError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not update this delivery.'));
    }
  }

  if (isLoading) {
    return <p role="status">Loading your volunteer journeys…</p>;
  }

  if (profileError || routesError || assignmentsError) {
    return (
      <p role="alert">
        {getApiErrorMessage(
          profileError ?? routesError ?? assignmentsError,
          'Could not load volunteer journeys.',
        )}
      </p>
    );
  }

  if (!profile) {
    return <p role="alert">Sign in again to load your volunteer dashboard.</p>;
  }

  const activeAssignments = assignments.filter(
    ({ delivery }) => delivery.status !== 'COMPLETED',
  );
  const completedAssignments = assignments.filter(
    ({ delivery }) => delivery.status === 'COMPLETED',
  );
  const assignedLegCount = assignments.reduce(
    (count, assignment) =>
      count +
      assignment.legs.filter(
        (leg) => leg.volunteer_id === profile.id && leg.status === 'ASSIGNED',
      ).length,
    0,
  );

  return (
    <section id="volunteer-dashboard-page">
      <h2 className="section-title">Volunteer Delivery Journeys</h2>
      <p className="form-subtitle">
        Publish routes you can travel, add relay stops, and work through each assigned delivery leg.
      </p>

      {formError && <p className="book-detail-error" role="alert">{formError}</p>}
      {notice && <p className="notification" role="status">{notice}</p>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">My routes</div>
          <div className="stat-value">{volunteerRoutes.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active journeys</div>
          <div className="stat-value">{activeAssignments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Legs waiting for me</div>
          <div className="stat-value">{assignedLegCount}</div>
        </div>
      </div>

      <div className="volunteer-dashboard-grid">
        <section className="volunteer-panel">
          <h3 className="section-title">Publish a route</h3>
          <p className="volunteer-help">
            Store managers can match delivery requests to your route and combine routes into a multi-volunteer journey.
          </p>
          <form onSubmit={handleCreateRoute}>
            <div className="form-group">
              <label htmlFor="route-origin">Starting location</label>
              <input
                id="route-origin"
                value={originLocation}
                onChange={(event) => setOriginLocation(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="route-destination">Destination</label>
              <input
                id="route-destination"
                value={destinationLocation}
                onChange={(event) => setDestinationLocation(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="route-date">Travel date</label>
              <input
                id="route-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={travelDate}
                onChange={(event) => setTravelDate(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="route-capacity">Book capacity</label>
              <input
                id="route-capacity"
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-success" type="submit" disabled={isBusy}>
              {isCreatingRoute ? 'Publishing…' : 'Publish route'}
            </button>
          </form>
        </section>

        <section className="volunteer-panel">
          <h3 className="section-title">Add a relay stop</h3>
          <p className="volunteer-help">
            Relay stops form the handover points that connect one volunteer leg to the next.
          </p>
          {volunteerRoutes.length ? (
            <form onSubmit={handleAddRelay}>
              <div className="form-group">
                <label htmlFor="relay-route">My route</label>
                <select
                  id="relay-route"
                  value={selectedRouteId}
                  onChange={(event) => selectRoute(event.target.value)}
                  required
                >
                  <option value="">Choose a route</option>
                  {volunteerRoutes.map(({ route }) => (
                    <option value={route.id} key={route.id}>
                      {route.origin_location} to {route.destination_location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="relay-location">Relay location</label>
                <input
                  id="relay-location"
                  value={relayLocation}
                  onChange={(event) => setRelayLocation(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="relay-sequence">Stop number</label>
                <input
                  id="relay-sequence"
                  type="number"
                  min="1"
                  step="1"
                  value={relaySequence}
                  onChange={(event) => setRelaySequence(event.target.value)}
                  required
                />
              </div>
              <button className="btn" type="submit" disabled={isBusy}>
                {isCreatingRelay ? 'Adding stop…' : 'Add relay stop'}
              </button>
            </form>
          ) : (
            <p>Publish a route first to add relay stops.</p>
          )}
        </section>
      </div>

      <h3 className="section-title">My published routes</h3>
      {volunteerRoutes.length ? (
        <div className="volunteer-route-list">
          {volunteerRoutes.map(({ route, relays }) => (
            <article className="volunteer-panel" key={route.id}>
              <div className="volunteer-route-heading">
                <h4>{route.origin_location} <span aria-hidden="true">→</span> {route.destination_location}</h4>
                <button
                  className={`tab ${selectedRouteId === route.id ? 'active' : ''}`}
                  type="button"
                  aria-pressed={selectedRouteId === route.id}
                  onClick={() => selectRoute(route.id)}
                >
                  Add a stop
                </button>
              </div>
              <p className="volunteer-help">
                Travel date {route.travel_date.slice(0, 10)} · Capacity {route.capacity}
              </p>
              {relays.length ? (
                <ol className="volunteer-relay-list">
                  {relays.map((relay) => (
                    <li key={relay.id}>Stop {relay.sequence}: {relay.location}</li>
                  ))}
                </ol>
              ) : (
                <p className="volunteer-help">No relay stops added.</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>No routes published yet.</p>
      )}

      <h3 className="section-title">Assigned delivery journeys</h3>
      {activeAssignments.length ? (
        <div className="volunteer-assignment-list">
          {activeAssignments.map((assignment) => (
            <AssignmentCard
              assignment={assignment}
              volunteerId={profile.id}
              busy={isBusy}
              relayLocation={relayLocations[assignment.delivery.id] ?? ''}
              onRelayLocationChange={(location) => {
                setRelayLocations((current) => ({
                  ...current,
                  [assignment.delivery.id]: location,
                }));
              }}
              onAction={runDeliveryAction}
              onAccept={() => acceptAssignment(assignment.delivery.id).unwrap()}
              onReject={() => rejectAssignment(assignment.delivery.id).unwrap()}
              onUpdateStatus={(status, location) =>
                updateStatus({
                  deliveryId: assignment.delivery.id,
                  status,
                  location,
                }).unwrap()}
              onComplete={() => completeDelivery(assignment.delivery.id).unwrap()}
            />
          ))}
        </div>
      ) : (
        <p>No active delivery assignments yet. Publish routes to become available for matching.</p>
      )}

      {completedAssignments.length > 0 && (
        <>
          <h3 className="section-title">Completed journeys</h3>
          <div className="volunteer-assignment-list">
            {completedAssignments.map((assignment) => (
              <AssignmentCard
                assignment={assignment}
                volunteerId={profile.id}
                busy={isBusy}
                relayLocation=""
                onRelayLocationChange={() => undefined}
                onAction={runDeliveryAction}
                onAccept={() => acceptAssignment(assignment.delivery.id).unwrap()}
                onReject={() => rejectAssignment(assignment.delivery.id).unwrap()}
                onUpdateStatus={(status, location) =>
                  updateStatus({
                    deliveryId: assignment.delivery.id,
                    status,
                    location,
                  }).unwrap()}
                onComplete={() => completeDelivery(assignment.delivery.id).unwrap()}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AssignmentCard({
  assignment,
  volunteerId,
  busy,
  relayLocation,
  onRelayLocationChange,
  onAction,
  onAccept,
  onReject,
  onUpdateStatus,
  onComplete,
}: {
  assignment: VolunteerAssignment;
  volunteerId: string;
  busy: boolean;
  relayLocation: string;
  onRelayLocationChange: (location: string) => void;
  onAction: (action: () => Promise<unknown>, successMessage: string) => Promise<void>;
  onAccept: () => Promise<unknown>;
  onReject: () => Promise<unknown>;
  onUpdateStatus: (
    status: 'IN_TRANSIT' | 'AT_RELAY',
    location?: string,
  ) => Promise<unknown>;
  onComplete: () => Promise<unknown>;
}) {
  const { delivery, legs, relays, routes, events } = assignment;
  const currentLeg = legs.find(
    (leg) => leg.volunteer_id === volunteerId && leg.status !== 'COMPLETED',
  );
  const currentRoute = currentLeg
    ? routes.find((route) => route.id === currentLeg.route_id)
    : undefined;
  const currentRelays = currentLeg
    ? relays
      .filter((relay) => relay.route_id === currentLeg.route_id)
      .sort((first, second) => first.sequence - second.sequence)
    : [];

  return (
    <article className="volunteer-panel">
      <div className="volunteer-route-heading">
        <div>
          <h4>Journey {delivery.id.slice(0, 8)}</h4>
          <p className="volunteer-help">
            {delivery.pickup_location} <span aria-hidden="true">→</span> {delivery.delivery_location}
          </p>
        </div>
        <span className={`volunteer-status status-${delivery.status.toLowerCase()}`}>
          {statusLabel(delivery.status)}
        </span>
      </div>

      <ol className="volunteer-journey-steps">
        {legs.map((leg) => {
          const route = routes.find((candidate) => candidate.id === leg.route_id);
          const routeRelays = relays
            .filter((relay) => relay.route_id === leg.route_id)
            .sort((first, second) => first.sequence - second.sequence);
          return (
            <li
              className={leg.id === currentLeg?.id ? 'current' : ''}
              key={leg.id}
            >
              <strong>Leg {leg.sequence}</strong>
              <span>
                {route
                  ? `${route.origin_location} to ${route.destination_location}`
                  : `Route ${leg.route_id.slice(0, 8)}`}
              </span>
              <span className="volunteer-step-status">
                {leg.volunteer_id === volunteerId ? 'You' : 'Volunteer'} · {statusLabel(leg.status)}
              </span>
              {routeRelays.length > 0 && (
                <span className="volunteer-step-relays">
                  Relay stops: {routeRelays.map(({ location }) => location).join(' → ')}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {currentLeg ? (
        <div className="volunteer-assignment-actions">
          {currentLeg.status === 'ASSIGNED' && (
            <>
              <button
                className="btn btn-success"
                type="button"
                disabled={busy}
                onClick={() => void onAction(onAccept, 'Assignment accepted.')}
              >
                Accept leg
              </button>
              {currentLeg.sequence === 1 && (
                <button
                  className="btn btn-danger"
                  type="button"
                  disabled={busy}
                  onClick={() => void onAction(onReject, 'Assignment rejected and returned for reassignment.')}
                >
                  Decline leg
                </button>
              )}
            </>
          )}

          {currentLeg.status === 'ACCEPTED' && currentLeg.sequence === 1 && (
            <p role="status">Accepted. Wait for the store manager to hand over the book.</p>
          )}

          {(currentLeg.status === 'HANDED_OVER' ||
            (currentLeg.status === 'ACCEPTED' && currentLeg.sequence > 1)) && (
            <button
              className="btn btn-success"
              type="button"
              disabled={busy}
              onClick={() => void onAction(
                () => onUpdateStatus('IN_TRANSIT'),
                'Journey leg marked in transit.',
              )}
            >
              Start delivery leg
            </button>
          )}

          {currentLeg.status === 'IN_TRANSIT' && currentRelays.length > 0 && (
            <div className="volunteer-relay-action">
              <label htmlFor={`relay-stop-${delivery.id}`}>Relay stop reached</label>
              <select
                id={`relay-stop-${delivery.id}`}
                value={relayLocation}
                onChange={(event) => onRelayLocationChange(event.target.value)}
              >
                <option value="">Choose a stop</option>
                {currentRelays.map((relay) => (
                  <option key={relay.id} value={relay.location}>
                    Stop {relay.sequence}: {relay.location}
                  </option>
                ))}
              </select>
              <button
                className="btn"
                type="button"
                disabled={busy || !relayLocation}
                onClick={() => void onAction(
                  () => onUpdateStatus('AT_RELAY', relayLocation),
                  `Marked arrival at ${relayLocation}.`,
                )}
              >
                Mark relay arrival
              </button>
            </div>
          )}

          {currentLeg.status === 'AT_RELAY' && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => void onAction(
                () => onUpdateStatus('IN_TRANSIT'),
                'Journey resumed from the relay stop.',
              )}
            >
              Resume journey
            </button>
          )}

          {(currentLeg.status === 'IN_TRANSIT' || currentLeg.status === 'AT_RELAY') && (
            <button
              className="btn btn-success"
              type="button"
              disabled={busy}
              onClick={() => void onAction(
                onComplete,
                currentLeg.sequence < legs.length
                  ? 'Leg complete. The next volunteer has been assigned.'
                  : 'Journey complete. The book arrived at its destination.',
              )}
            >
              Complete leg
            </button>
          )}

          {currentLeg.status === 'ACCEPTED' && currentLeg.sequence > 1 && currentRoute && (
            <p className="volunteer-help">
              Your route is {currentRoute.origin_location} to {currentRoute.destination_location}.
            </p>
          )}
        </div>
      ) : (
        <p className="volunteer-help">Your assigned leg is complete.</p>
      )}

      <details className="volunteer-tracking">
        <summary>Journey updates ({events.length})</summary>
        {events.length ? (
          <ol>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{statusLabel(event.status)}</strong>
                {' · '}{new Date(event.created_at).toLocaleString()}
                {event.location && ` · ${event.location}`}
                {event.note && ` — ${event.note}`}
              </li>
            ))}
          </ol>
        ) : (
          <p>No tracking events yet.</p>
        )}
      </details>
    </article>
  );
}

export default VolunteerDashboard;
