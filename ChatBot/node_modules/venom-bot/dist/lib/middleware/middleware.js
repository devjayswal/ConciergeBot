var ExposedFn;
(function (ExposedFn) {
    ExposedFn["OnMessage"] = "onMessage";
    ExposedFn["OnAck"] = "onAck";
    ExposedFn["OnParticipantsChanged"] = "onParticipantsChanged";
})(ExposedFn || (ExposedFn = {}));
/**
 * Exposes [OnMessage] function
 */
window.WAPI.waitNewMessages(false, (data) => {
    data.forEach((message) => {
        window[ExposedFn.OnMessage](message);
    });
});
window.WAPI.waitNewAcknowledgements(function (data) {
    if (window[ExposedFn.OnAck]) {
        window[ExposedFn.OnAck](data);
    }
});
//# sourceMappingURL=middleware.js.map