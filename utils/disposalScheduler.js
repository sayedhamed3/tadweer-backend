const cron = require("node-cron");
const Company = require("../models/Company");
const Disposal = require("../models/Disposal");

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily disposal scheduler...");

  try {
    const companies = await Company.find({ "pickUpSchedule.0": { $exists: true } });

    for (const company of companies) {
      for (const schedule of company.pickUpSchedule) {
        // Check if today matches the scheduled day
        const today = new Date();
        const todayDay = today.toLocaleDateString("en-US", { weekday: "long" });

        // Compare today's day with the schedule day
        if (schedule.day === todayDay) {
          // Split time string "10:00" into [10, 00] (hours, minutes)
          const [hours, minutes] = schedule.time.split(":").map(Number);

          // Create a new Date object for today with the specified hours and minutes in local time
          const disposalDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

          // Adjust for the time zone difference (e.g., UTC+3)
          disposalDate.setHours(disposalDate.getHours() + 3);

          // Check if disposal already exists for today
          const existingDisposal = await Disposal.findOne({
            company: company._id,
            disposalDate: {
              $gte: new Date(disposalDate.getTime() - 60 * 60 * 1000), // 1 hour buffer
              $lt: new Date(disposalDate.getTime() + 60 * 60 * 1000) // 1 hour buffer
            }
          });

            if (existingDisposal) {
            console.log(`Disposal already exists for company ${company._id} on ${disposalDate}`);
            // go to next iteration
            continue;
          }

          // Create a new disposal with the generated date
          const newDisposal = new Disposal({
            company: company._id,
            disposalDate: disposalDate, // Use the adjusted disposalDate
            addressName: schedule.addressName,
            status: "Pending"
          });

          // Save the new disposal
          await newDisposal.save();
        }
      }
    }
  } catch (err) {
    console.error("Error creating scheduled disposals:", err.message);
  }
});
