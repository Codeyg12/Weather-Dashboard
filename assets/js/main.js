

$.ajax({
    url: "api.openweathermap.org/data/2.5/forecast?q={city name}&appid=0830fec5fefb765b207129fdb7fcdf86",
    type: "GET",
    success: function (response) {
        console.log(response)
    },
    error: function (error) {
        console.log(error)
    }
})

















// let currentTimeEl = $("#currentTime")
// currentTimeNow = dayjs().format("MMMM D, YYYY h:mm A")
// currentTimeEl.append(currentTimeNow)

  