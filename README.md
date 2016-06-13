# hap-time
A lightweight and compact HTML/CSS/JavaScript time picker control. 

This control is implemented as a jQuery plugin. The following HTML is required for each instance:

```html
<div id='hap-time-1' class='hap-time'>
    <input class='hap-time-hour' maxlength='2'>
    <span class='hap-time-separator'>:</span>
    <input class='hap-time-minute' maxlength='2'>
    <div class='hap-time-meridiem'><p class='active'>AM</p><p>PM</p></div>
</div>
```

Each instance must be initialized with JavaScript & have the desired time inserted:

```javascript
// Initialize all the HAP time objects.
$(".hap-time").haptime();

// Set the first HAP Time object to the current time using a Date object.
$("#hap-time-1").haptime("setTime", new Date());
```

The time to display can also be set using an ISO type time string:

```javascript
$("#hap-time-2").haptime("setTime", "15:33:00");
```
