import i18n from './i18n'

// lets define the maintenance cost as a constant
// after starting the plugin with `$ luucy serve` try to change this value and watch how luucy will automatically reload the application
const maintenanceCost = 0.28;

// create a section
// this section will contain all of our labels and inputs
// you'll see it in the left panel when opening a project
const section = ui.createProjectPanelSection();

// will show the total volume of the variants buildings
// we'll leave the value empty for now
const volumeLabel = new ui.LabeledValue(i18n.Volume());
section.add(volumeLabel);

// a numerical input allows the users to set a custom price per m³
// we'll subscribe to the onValueChange event of this input later on to catch whenever a user changes the price
const pricePerVolumeInput = new ui.NumberField(i18n.Heating_Cost_Per_Cubic_Meter(), 4.269);
section.add(pricePerVolumeInput);

// the following labels will be updated with the calculated values when the volume or price changes
const monthlyCostLabel = new ui.LabeledValue(i18n.Monthly_Cost());
section.add(monthlyCostLabel);

const yearlyCostLabel = new ui.LabeledValue(i18n.Yearly_Cost());
section.add(yearlyCostLabel);

const totalCost = new ui.LabeledValue(i18n.Total_Cost_10_Years({maintenanceCost: (maintenanceCost * 100).toFixed(0)}));
section.add(totalCost);


// this event will be called whenever a project is selected
data.onProjectSelect.subscribe(project => {
    // we want to know when a variant is selected, thus we subscribe to this event
    // note the ? after project: the onProjectSelect event will be called with `null` when no project is selected!
    project?.onVariantSelect.subscribe(variant => {
        if (variant) {
            // we want to get notified whenever the volume changes (eg. new building placed or modified) or when the user changes the price input
            // using Event.subscribe allows us to subscribe to both events at the same time
            Event.subscribe(pricePerVolumeInput.onValueChange, () => {
                // calculate costs and update the cost values
                monthlyCostLabel.value = (variant.totalVolume.total * pricePerVolumeInput.value).toFloatingString('CHF');
                yearlyCostLabel.value = (variant.totalVolume.total * pricePerVolumeInput.value * 12).toFloatingString('CHF');
                totalCost.value = (variant.totalVolume.total * pricePerVolumeInput.value * 12 * 10 * (1 + maintenanceCost)).toFloatingString('CHF');
            });
            Event.subscribe(variant.onTotalVolumeChange, () => {
                // update the value of the volume label
                volumeLabel.value = variant.totalVolume.total.toMetricVolumeString();

                // calculate costs and update the cost values
                monthlyCostLabel.value = (variant.totalVolume.total * pricePerVolumeInput.value).toFloatingString('CHF');
                yearlyCostLabel.value = (variant.totalVolume.total * pricePerVolumeInput.value * 12).toFloatingString('CHF');
                totalCost.value = (variant.totalVolume.total * pricePerVolumeInput.value * 12 * 10 * (1 + maintenanceCost)).toFloatingString('CHF');
            });
        } else {
            // if no variant is selected, onVariantSelect will be called too
            // lets clear all the labels 
            volumeLabel.value = "";
            monthlyCostLabel.value = "";
            yearlyCostLabel.value = "";
            totalCost.value = "";
        }
    });
});