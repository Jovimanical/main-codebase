$(".bookingJs").on('click', function () {
    let requestId = $(this).parents('tr').find('.field-request_id a').text()
    let clientEmail = $(this).parents('tr').find('.field-email').text()
    let clientName = $(this).parents('tr').find('.field-full_name').text()
    let tutorSelectedEmail = $(this).parents('tr').find('.field-tutor_selected').text()
    let remarks = $(this).parents('tr').find('.field-remarks p').text()
    let budget = $(this).parents('tr').find('.field-budget').text()
    let requestUrl = $(this).data("requestUrl");
    let requestSlug = $(this).data("requestSlug");
    let obj = {
        requestId,
        requestUrl,
        requestSlug,
        clientName,
        clientEmail,
        tutorSelectedEmail,
        remarks,
        budget
    }
    console.log(obj)
    window.unMountBookingModal();
    window.renderBookingModal(obj);
})

$(".clientRequestJs").on("click", function () {
    let requestId = $(this).parents('tr').find('.field-request_id a').text()
    let clientEmail = $(this).parents('tr').find('.field-email').text()
    let clientName = $(this).parents('tr').find('.field-full_name').text()
    let totalBudget = $(this).parents('tr').find('.field-budget').text()
    let hourlyBudget = $(this).parents('tr').find('.field-per_hour').text()
    let requestSubjects = $(this).parents('tr').find('.field-request_subjects').text()

    let requestSlug = $(this).data("requestSlug");
    let requestUrl = $(this).data("requestUrl");

    let obj = {
        requestId,
        requestUrl,
        requestSlug,
        clientName,
        clientEmail,
        requestSubjects,
        totalBudget,
        hourlyBudget
    };
    window.unMountSalesModal();
    window.renderSalesModal(obj);
});
