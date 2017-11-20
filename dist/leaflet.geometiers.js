/* global module */
// # simple-statistics
//
// A simple, literate statistics system. The code below uses the
// [Javascript module pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth),
// eventually assigning `simple-statistics` to `ss` in browsers or the
// `exports` object for node.js
(function() {
    var ss = {};

    if (typeof module !== 'undefined') {
        // Assign the `ss` object to exports, so that you can require
        // it in [node.js](http://nodejs.org/)
        module.exports = ss;
    } else {
        // Otherwise, in a browser, we assign `ss` to the window object,
        // so you can simply refer to it as `ss`.
        this.ss = ss;
    }

    // # [Linear Regression](http://en.wikipedia.org/wiki/Linear_regression)
    //
    // [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
    // is a simple way to find a fitted line
    // between a set of coordinates.
    function linear_regression() {
        var linreg = {},
            data = [];

        // Assign data to the model. Data is assumed to be an array.
        linreg.data = function(x) {
            if (!arguments.length) return data;
            data = x.slice();
            return linreg;
        };

        // Calculate the slope and y-intercept of the regression line
        // by calculating the least sum of squares
        linreg.mb = function() {
            var m, b;

            // Store data length in a local variable to reduce
            // repeated object property lookups
            var data_length = data.length;

            //if there's only one point, arbitrarily choose a slope of 0
            //and a y-intercept of whatever the y of the initial point is
            if (data_length === 1) {
                m = 0;
                b = data[0][1];
            } else {
                // Initialize our sums and scope the `m` and `b`
                // variables that define the line.
                var sum_x = 0, sum_y = 0,
                    sum_xx = 0, sum_xy = 0;

                // Use local variables to grab point values
                // with minimal object property lookups
                var point, x, y;

                // Gather the sum of all x values, the sum of all
                // y values, and the sum of x^2 and (x*y) for each
                // value.
                //
                // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
                for (var i = 0; i < data_length; i++) {
                    point = data[i];
                    x = point[0];
                    y = point[1];

                    sum_x += x;
                    sum_y += y;

                    sum_xx += x * x;
                    sum_xy += x * y;
                }

                // `m` is the slope of the regression line
                m = ((data_length * sum_xy) - (sum_x * sum_y)) /
                    ((data_length * sum_xx) - (sum_x * sum_x));

                // `b` is the y-intercept of the line.
                b = (sum_y / data_length) - ((m * sum_x) / data_length);
            }

            // Return both values as an object.
            return { m: m, b: b };
        };

        // a shortcut for simply getting the slope of the regression line
        linreg.m = function() {
            return linreg.mb().m;
        };

        // a shortcut for simply getting the y-intercept of the regression
        // line.
        linreg.b = function() {
            return linreg.mb().b;
        };

        // ## Fitting The Regression Line
        //
        // This is called after `.data()` and returns the
        // equation `y = f(x)` which gives the position
        // of the regression line at each point in `x`.
        linreg.line = function() {

            // Get the slope, `m`, and y-intercept, `b`, of the line.
            var mb = linreg.mb(),
                m = mb.m,
                b = mb.b;

            // Return a function that computes a `y` value for each
            // x value it is given, based on the values of `b` and `a`
            // that we just computed.
            return function(x) {
                return b + (m * x);
            };
        };

        return linreg;
    }

    // # [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
    //
    // The r-squared value of data compared with a function `f`
    // is the sum of the squared differences between the prediction
    // and the actual value.
    function r_squared(data, f) {
        if (data.length < 2) return 1;

        // Compute the average y value for the actual
        // data set in order to compute the
        // _total sum of squares_
        var sum = 0, average;
        for (var i = 0; i < data.length; i++) {
            sum += data[i][1];
        }
        average = sum / data.length;

        // Compute the total sum of squares - the
        // squared difference between each point
        // and the average of all points.
        var sum_of_squares = 0;
        for (var j = 0; j < data.length; j++) {
            sum_of_squares += Math.pow(average - data[j][1], 2);
        }

        // Finally estimate the error: the squared
        // difference between the estimate and the actual data
        // value at each point.
        var err = 0;
        for (var k = 0; k < data.length; k++) {
            err += Math.pow(data[k][1] - f(data[k][0]), 2);
        }

        // As the error grows larger, its ratio to the
        // sum of squares increases and the r squared
        // value grows lower.
        return 1 - (err / sum_of_squares);
    }


    // # [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
    //
    // This is a naïve bayesian classifier that takes
    // singly-nested objects.
    function bayesian() {
        // The `bayes_model` object is what will be exposed
        // by this closure, with all of its extended methods, and will
        // have access to all scope variables, like `total_count`.
        var bayes_model = {},
            // The number of items that are currently
            // classified in the model
            total_count = 0,
            // Every item classified in the model
            data = {};

        // ## Train
        // Train the classifier with a new item, which has a single
        // dimension of Javascript literal keys and values.
        bayes_model.train = function(item, category) {
            // If the data object doesn't have any values
            // for this category, create a new object for it.
            if (!data[category]) data[category] = {};

            // Iterate through each key in the item.
            for (var k in item) {
                var v = item[k];
                // Initialize the nested object `data[category][k][item[k]]`
                // with an object of keys that equal 0.
                if (data[category][k] === undefined) data[category][k] = {};
                if (data[category][k][v] === undefined) data[category][k][v] = 0;

                // And increment the key for this key/value combination.
                data[category][k][item[k]]++;
            }
            // Increment the number of items classified
            total_count++;
        };

        // ## Score
        // Generate a score of how well this item matches all
        // possible categories based on its attributes
        bayes_model.score = function(item) {
            // Initialize an empty array of odds per category.
            var odds = {}, category;
            // Iterate through each key in the item,
            // then iterate through each category that has been used
            // in previous calls to `.train()`
            for (var k in item) {
                var v = item[k];
                for (category in data) {
                    // Create an empty object for storing key - value combinations
                    // for this category.
                    if (odds[category] === undefined) odds[category] = {};

                    // If this item doesn't even have a property, it counts for nothing,
                    // but if it does have the property that we're looking for from
                    // the item to categorize, it counts based on how popular it is
                    // versus the whole population.
                    if (data[category][k]) {
                        odds[category][k + '_' + v] = (data[category][k][v] || 0) / total_count;
                    } else {
                        odds[category][k + '_' + v] = 0;
                    }
                }
            }

            // Set up a new object that will contain sums of these odds by category
            var odds_sums = {};

            for (category in odds) {
                // Tally all of the odds for each category-combination pair -
                // the non-existence of a category does not add anything to the
                // score.
                for (var combination in odds[category]) {
                    if (odds_sums[category] === undefined) odds_sums[category] = 0;
                    odds_sums[category] += odds[category][combination];
                }
            }

            return odds_sums;
        };

        // Return the completed model.
        return bayes_model;
    }

    // # sum
    //
    // is simply the result of adding all numbers
    // together, starting from zero.
    //
    // This runs on `O(n)`, linear time in respect to the array
    function sum(x) {
        var value = 0;
        for (var i = 0; i < x.length; i++) {
            value += x[i];
        }
        return value;
    }

    // # mean
    //
    // is the sum over the number of values
    //
    // This runs on `O(n)`, linear time in respect to the array
    function mean(x) {
        // The mean of no numbers is null
        if (x.length === 0) return null;

        return sum(x) / x.length;
    }

    // # geometric mean
    //
    // a mean function that is more useful for numbers in different
    // ranges.
    //
    // this is the nth root of the input numbers multiplied by each other
    //
    // This runs on `O(n)`, linear time in respect to the array
    function geometric_mean(x) {
        // The mean of no numbers is null
        if (x.length === 0) return null;

        // the starting value.
        var value = 1;

        for (var i = 0; i < x.length; i++) {
            // the geometric mean is only valid for positive numbers
            if (x[i] <= 0) return null;

            // repeatedly multiply the value by each number
            value *= x[i];
        }

        return Math.pow(value, 1 / x.length);
    }


    // # harmonic mean
    //
    // a mean function typically used to find the average of rates
    //
    // this is the reciprocal of the arithmetic mean of the reciprocals
    // of the input numbers
    //
    // This runs on `O(n)`, linear time in respect to the array
    function harmonic_mean(x) {
        // The mean of no numbers is null
        if (x.length === 0) return null;

        var reciprocal_sum = 0;

        for (var i = 0; i < x.length; i++) {
            // the harmonic mean is only valid for positive numbers
            if (x[i] <= 0) return null;

            reciprocal_sum += 1 / x[i];
        }

        // divide n by the the reciprocal sum
        return x.length / reciprocal_sum;
    }

    // root mean square (RMS)
    //
    // a mean function used as a measure of the magnitude of a set
    // of numbers, regardless of their sign
    //
    // this is the square root of the mean of the squares of the 
    // input numbers
    //
    // This runs on `O(n)`, linear time in respect to the array
    function root_mean_square(x) {
        if (x.length === 0) return null;

        var sum_of_squares = 0;
        for (var i = 0; i < x.length; i++) {
            sum_of_squares += Math.pow(x[i], 2);
        }

        return Math.sqrt(sum_of_squares / x.length);
    }

    // # min
    //
    // This is simply the minimum number in the set.
    //
    // This runs on `O(n)`, linear time in respect to the array
    function min(x) {
        var value;
        for (var i = 0; i < x.length; i++) {
            // On the first iteration of this loop, min is
            // undefined and is thus made the minimum element in the array
            if (x[i] < value || value === undefined) value = x[i];
        }
        return value;
    }

    // # max
    //
    // This is simply the maximum number in the set.
    //
    // This runs on `O(n)`, linear time in respect to the array
    function max(x) {
        var value;
        for (var i = 0; i < x.length; i++) {
            // On the first iteration of this loop, max is
            // undefined and is thus made the maximum element in the array
            if (x[i] > value || value === undefined) value = x[i];
        }
        return value;
    }

    // # [variance](http://en.wikipedia.org/wiki/Variance)
    //
    // is the sum of squared deviations from the mean
    //
    // depends on `mean()`
    function variance(x) {
        // The variance of no numbers is null
        if (x.length === 0) return null;

        var mean_value = mean(x),
            deviations = [];

        // Make a list of squared deviations from the mean.
        for (var i = 0; i < x.length; i++) {
            deviations.push(Math.pow(x[i] - mean_value, 2));
        }

        // Find the mean value of that list
        return mean(deviations);
    }

    // # [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
    //
    // is just the square root of the variance.
    //
    // depends on `variance()`
    function standard_deviation(x) {
        // The standard deviation of no numbers is null
        if (x.length === 0) return null;

        return Math.sqrt(variance(x));
    }

    // The sum of deviations to the Nth power.
    // When n=2 it's the sum of squared deviations.
    // When n=3 it's the sum of cubed deviations.
    //
    // depends on `mean()`
    function sum_nth_power_deviations(x, n) {
        var mean_value = mean(x),
            sum = 0;

        for (var i = 0; i < x.length; i++) {
            sum += Math.pow(x[i] - mean_value, n);
        }

        return sum;
    }

    // # [variance](http://en.wikipedia.org/wiki/Variance)
    //
    // is the sum of squared deviations from the mean
    //
    // depends on `sum_nth_power_deviations`
    function sample_variance(x) {
        // The variance of no numbers is null
        if (x.length <= 1) return null;

        var sum_squared_deviations_value = sum_nth_power_deviations(x, 2);

        // Find the mean value of that list
        return sum_squared_deviations_value / (x.length - 1);
    }

    // # [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
    //
    // is just the square root of the variance.
    //
    // depends on `sample_variance()`
    function sample_standard_deviation(x) {
        // The standard deviation of no numbers is null
        if (x.length <= 1) return null;

        return Math.sqrt(sample_variance(x));
    }

    // # [covariance](http://en.wikipedia.org/wiki/Covariance)
    //
    // sample covariance of two datasets:
    // how much do the two datasets move together?
    // x and y are two datasets, represented as arrays of numbers.
    //
    // depends on `mean()`
    function sample_covariance(x, y) {

        // The two datasets must have the same length which must be more than 1
        if (x.length <= 1 || x.length != y.length){
            return null;
        }

        // determine the mean of each dataset so that we can judge each
        // value of the dataset fairly as the difference from the mean. this
        // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
        // does not suffer because of the difference in absolute values
        var xmean = mean(x),
            ymean = mean(y),
            sum = 0;

        // for each pair of values, the covariance increases when their
        // difference from the mean is associated - if both are well above
        // or if both are well below
        // the mean, the covariance increases significantly.
        for (var i = 0; i < x.length; i++){
            sum += (x[i] - xmean) * (y[i] - ymean);
        }

        // the covariance is weighted by the length of the datasets.
        return sum / (x.length - 1);
    }

    // # [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence)
    //
    // Gets a measure of how correlated two datasets are, between -1 and 1
    //
    // depends on `sample_standard_deviation()` and `sample_covariance()`
    function sample_correlation(x, y) {
        var cov = sample_covariance(x, y),
            xstd = sample_standard_deviation(x),
            ystd = sample_standard_deviation(y);

        if (cov === null || xstd === null || ystd === null) {
            return null;
        }

        return cov / xstd / ystd;
    }

    // # [median](http://en.wikipedia.org/wiki/Median)
    //
    // The middle number of a list. This is often a good indicator of 'the middle'
    // when there are outliers that skew the `mean()` value.
    function median(x) {
        // The median of an empty list is null
        if (x.length === 0) return null;

        // Sorting the array makes it easy to find the center, but
        // use `.slice()` to ensure the original array `x` is not modified
        var sorted = x.slice().sort(function (a, b) { return a - b; });

        // If the length of the list is odd, it's the central number
        if (sorted.length % 2 === 1) {
            return sorted[(sorted.length - 1) / 2];
        // Otherwise, the median is the average of the two numbers
        // at the center of the list
        } else {
            var a = sorted[(sorted.length / 2) - 1];
            var b = sorted[(sorted.length / 2)];
            return (a + b) / 2;
        }
    }

    // # [mode](http://bit.ly/W5K4Yt)
    //
    // The mode is the number that appears in a list the highest number of times.
    // There can be multiple modes in a list: in the event of a tie, this
    // algorithm will return the most recently seen mode.
    //
    // This implementation is inspired by [science.js](https://github.com/jasondavies/science.js/blob/master/src/stats/mode.js)
    //
    // This runs on `O(n)`, linear time in respect to the array
    function mode(x) {

        // Handle edge cases:
        // The median of an empty list is null
        if (x.length === 0) return null;
        else if (x.length === 1) return x[0];

        // Sorting the array lets us iterate through it below and be sure
        // that every time we see a new number it's new and we'll never
        // see the same number twice
        var sorted = x.slice().sort(function (a, b) { return a - b; });

        // This assumes it is dealing with an array of size > 1, since size
        // 0 and 1 are handled immediately. Hence it starts at index 1 in the
        // array.
        var last = sorted[0],
            // store the mode as we find new modes
            value,
            // store how many times we've seen the mode
            max_seen = 0,
            // how many times the current candidate for the mode
            // has been seen
            seen_this = 1;

        // end at sorted.length + 1 to fix the case in which the mode is
        // the highest number that occurs in the sequence. the last iteration
        // compares sorted[i], which is undefined, to the highest number
        // in the series
        for (var i = 1; i < sorted.length + 1; i++) {
            // we're seeing a new number pass by
            if (sorted[i] !== last) {
                // the last number is the new mode since we saw it more
                // often than the old one
                if (seen_this > max_seen) {
                    max_seen = seen_this;
                    value = last;
                }
                seen_this = 1;
                last = sorted[i];
            // if this isn't a new number, it's one more occurrence of
            // the potential mode
            } else { seen_this++; }
        }
        return value;
    }

    // # [t-test](http://en.wikipedia.org/wiki/Student's_t-test)
    //
    // This is to compute a one-sample t-test, comparing the mean
    // of a sample to a known value, x.
    //
    // in this case, we're trying to determine whether the
    // population mean is equal to the value that we know, which is `x`
    // here. usually the results here are used to look up a
    // [p-value](http://en.wikipedia.org/wiki/P-value), which, for
    // a certain level of significance, will let you determine that the
    // null hypothesis can or cannot be rejected.
    //
    // Depends on `standard_deviation()` and `mean()`
    function t_test(sample, x) {
        // The mean of the sample
        var sample_mean = mean(sample);

        // The standard deviation of the sample
        var sd = standard_deviation(sample);

        // Square root the length of the sample
        var rootN = Math.sqrt(sample.length);

        // Compute the known value against the sample,
        // returning the t value
        return (sample_mean - x) / (sd / rootN);
    }

    // # [2-sample t-test](http://en.wikipedia.org/wiki/Student's_t-test)
    //
    // This is to compute two sample t-test.
    // Tests whether "mean(X)-mean(Y) = difference", (
    // in the most common case, we often have `difference == 0` to test if two samples
    // are likely to be taken from populations with the same mean value) with
    // no prior knowledge on standard deviations of both samples
    // other than the fact that they have the same standard deviation.
    //
    // Usually the results here are used to look up a
    // [p-value](http://en.wikipedia.org/wiki/P-value), which, for
    // a certain level of significance, will let you determine that the
    // null hypothesis can or cannot be rejected.
    //
    // `diff` can be omitted if it equals 0.
    //
    // [This is used to confirm or deny](http://www.monarchlab.org/Lab/Research/Stats/2SampleT.aspx)
    // a null hypothesis that the two populations that have been sampled into
    // `sample_x` and `sample_y` are equal to each other.
    //
    // Depends on `sample_variance()` and `mean()`
    function t_test_two_sample(sample_x, sample_y, difference) {
        var n = sample_x.length,
            m = sample_y.length;

        // If either sample doesn't actually have any values, we can't
        // compute this at all, so we return `null`.
        if (!n || !m) return null ;

        // default difference (mu) is zero
        if (!difference) difference = 0;

        var meanX = mean(sample_x),
            meanY = mean(sample_y);

        var weightedVariance = ((n - 1) * sample_variance(sample_x) +
            (m - 1) * sample_variance(sample_y)) / (n + m - 2);

        return (meanX - meanY - difference) /
            Math.sqrt(weightedVariance * (1 / n + 1 / m));
    }

    // # chunk
    //
    // Split an array into chunks of a specified size. This function
    // has the same behavior as [PHP's array_chunk](http://php.net/manual/en/function.array-chunk.php)
    // function, and thus will insert smaller-sized chunks at the end if
    // the input size is not divisible by the chunk size.
    //
    // `sample` is expected to be an array, and `chunkSize` a number.
    // The `sample` array can contain any kind of data.
    function chunk(sample, chunkSize) {

        // a list of result chunks, as arrays in an array
        var output = [];

        // `chunkSize` must be zero or higher - otherwise the loop below,
        // in which we call `start += chunkSize`, will loop infinitely.
        // So, we'll detect and return null in that case to indicate
        // invalid input.
        if (chunkSize <= 0) {
            return null;
        }

        // `start` is the index at which `.slice` will start selecting
        // new array elements
        for (var start = 0; start < sample.length; start += chunkSize) {

            // for each chunk, slice that part of the array and add it
            // to the output. The `.slice` function does not change
            // the original array.
            output.push(sample.slice(start, start + chunkSize));
        }
        return output;
    }

    // # shuffle_in_place
    //
    // A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    // in-place - which means that it will change the order of the original
    // array by reference.
    function shuffle_in_place(sample, randomSource) {

        // a custom random number source can be provided if you want to use
        // a fixed seed or another random number generator, like
        // [random-js](https://www.npmjs.org/package/random-js)
        randomSource = randomSource || Math.random;

        // store the current length of the sample to determine
        // when no elements remain to shuffle.
        var length = sample.length;

        // temporary is used to hold an item when it is being
        // swapped between indices.
        var temporary;

        // The index to swap at each stage.
        var index;

        // While there are still items to shuffle
        while (length > 0) {
            // chose a random index within the subset of the array
            // that is not yet shuffled
            index = Math.floor(randomSource() * length--);

            // store the value that we'll move temporarily
            temporary = sample[length];

            // swap the value at `sample[length]` with `sample[index]`
            sample[length] = sample[index];
            sample[index] = temporary;
        }

        return sample;
    }

    // # shuffle
    //
    // A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    // is a fast way to create a random permutation of a finite set.
    function shuffle(sample, randomSource) {
        // slice the original array so that it is not modified
        sample = sample.slice();

        // and then shuffle that shallow-copied array, in place
        return shuffle_in_place(sample.slice(), randomSource);
    }

    // # sample
    //
    // Create a [simple random sample](http://en.wikipedia.org/wiki/Simple_random_sample)
    // from a given array of `n` elements.
    function sample(array, n, randomSource) {
        // shuffle the original array using a fisher-yates shuffle
        var shuffled = shuffle(array, randomSource);

        // and then return a subset of it - the first `n` elements.
        return shuffled.slice(0, n);
    }

    // # quantile
    //
    // This is a population quantile, since we assume to know the entire
    // dataset in this library. Thus I'm trying to follow the
    // [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
    // algorithm from wikipedia.
    //
    // Sample is a one-dimensional array of numbers,
    // and p is either a decimal number from 0 to 1 or an array of decimal
    // numbers from 0 to 1.
    // In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
    // with decimal values.
    // When p is an array, the result of the function is also an array containing the appropriate
    // quantiles in input order
    function quantile(sample, p) {

        // We can't derive quantiles from an empty list
        if (sample.length === 0) return null;

        // Sort a copy of the array. We'll need a sorted array to index
        // the values in sorted order.
        var sorted = sample.slice().sort(function (a, b) { return a - b; });

        if (p.length) {
            // Initialize the result array
            var results = [];
            // For each requested quantile
            for (var i = 0; i < p.length; i++) {
                results[i] = quantile_sorted(sorted, p[i]);
            }
            return results;
        } else {
            return quantile_sorted(sorted, p);
        }
    }

    // # quantile
    //
    // This is the internal implementation of quantiles: when you know
    // that the order is sorted, you don't need to re-sort it, and the computations
    // are much faster.
    function quantile_sorted(sample, p) {
        var idx = (sample.length) * p;
        if (p < 0 || p > 1) {
            return null;
        } else if (p === 1) {
            // If p is 1, directly return the last element
            return sample[sample.length - 1];
        } else if (p === 0) {
            // If p is 0, directly return the first element
            return sample[0];
        } else if (idx % 1 !== 0) {
            // If p is not integer, return the next element in array
            return sample[Math.ceil(idx) - 1];
        } else if (sample.length % 2 === 0) {
            // If the list has even-length, we'll take the average of this number
            // and the next value, if there is one
            return (sample[idx - 1] + sample[idx]) / 2;
        } else {
            // Finally, in the simple case of an integer value
            // with an odd-length list, return the sample value at the index.
            return sample[idx];
        }
    }

    // # [Interquartile range](http://en.wikipedia.org/wiki/Interquartile_range)
    //
    // A measure of statistical dispersion, or how scattered, spread, or
    // concentrated a distribution is. It's computed as the difference between
    // the third quartile and first quartile.
    function iqr(sample) {
        // We can't derive quantiles from an empty list
        if (sample.length === 0) return null;

        // Interquartile range is the span between the upper quartile,
        // at `0.75`, and lower quartile, `0.25`
        return quantile(sample, 0.75) - quantile(sample, 0.25);
    }

    // # [Median Absolute Deviation](http://en.wikipedia.org/wiki/Median_absolute_deviation)
    //
    // The Median Absolute Deviation (MAD) is a robust measure of statistical
    // dispersion. It is more resilient to outliers than the standard deviation.
    function mad(x) {
        // The mad of nothing is null
        if (!x || x.length === 0) return null;

        var median_value = median(x),
            median_absolute_deviations = [];

        // Make a list of absolute deviations from the median
        for (var i = 0; i < x.length; i++) {
            median_absolute_deviations.push(Math.abs(x[i] - median_value));
        }

        // Find the median value of that list
        return median(median_absolute_deviations);
    }

    // ## Compute Matrices for Jenks
    //
    // Compute the matrices required for Jenks breaks. These matrices
    // can be used for any classing of data with `classes <= n_classes`
    function jenksMatrices(data, n_classes) {

        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;

        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            // despite these arrays having the same values, we need
            // to keep them separate so that changing one does not change
            // the other
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }

        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }

        for (var l = 2; l < data.length + 1; l++) {

            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0,
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of
                w = 0,
                // `IV` originally
                i4 = 0;

            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {

                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];

                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;

                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;

                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;

                i4 = lower_class_limit - 1;

                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        // if adding this element to an existing class
                        // will increase its variance beyond the limit, break
                        // the class at this point, setting the `lower_class_limit`
                        // at this point.
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }

            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }

        // return the two matrices. for just providing breaks, only
        // `lower_class_limits` is needed, but variances can be useful to
        // evaluate goodness of fit.
        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    }

    // ## Pull Breaks Values for Jenks
    //
    // the second part of the jenks recipe: take the calculated matrices
    // and derive an array of n breaks.
    function jenksBreaks(data, lower_class_limits, n_classes) {

        var k = data.length - 1,
            kclass = [],
            countNum = n_classes;

        // the calculation of classes will never include the upper and
        // lower bounds, so we need to explicitly set them
        kclass[n_classes] = data[data.length - 1];
        kclass[0] = data[0];

        // the lower_class_limits matrix is used as indices into itself
        // here: the `k` variable is reused in each iteration.
        while (countNum > 1) {
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }

        return kclass;
    }

    // # [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
    //
    // Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
    // [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
    // [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)
    //
    // Depends on `jenksBreaks()` and `jenksMatrices()`
    function jenks(data, n_classes) {

        if (n_classes > data.length) return null;

        // sort data in numerical order, since this is expected
        // by the matrices function
        data = data.slice().sort(function (a, b) { return a - b; });

        // get our basic matrices
        var matrices = jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits;

        // extract n_classes out of the computed matrices
        return jenksBreaks(data, lower_class_limits, n_classes);

    }

    // # [Skewness](http://en.wikipedia.org/wiki/Skewness)
    //
    // A measure of the extent to which a probability distribution of a
    // real-valued random variable "leans" to one side of the mean.
    // The skewness value can be positive or negative, or even undefined.
    //
    // Implementation is based on the adjusted Fisher-Pearson standardized
    // moment coefficient, which is the version found in Excel and several
    // statistical packages including Minitab, SAS and SPSS.
    //
    // Depends on `sum_nth_power_deviations()` and `sample_standard_deviation`
    function sample_skewness(x) {
        // The skewness of less than three arguments is null
        if (x.length < 3) return null;

        var n = x.length,
            cubed_s = Math.pow(sample_standard_deviation(x), 3),
            sum_cubed_deviations = sum_nth_power_deviations(x, 3);

        return n * sum_cubed_deviations / ((n - 1) * (n - 2) * cubed_s);
    }

    // # Standard Normal Table
    // A standard normal table, also called the unit normal table or Z table,
    // is a mathematical table for the values of Φ (phi), which are the values of
    // the cumulative distribution function of the normal distribution.
    // It is used to find the probability that a statistic is observed below,
    // above, or between values on the standard normal distribution, and by
    // extension, any normal distribution.
    //
    // The probabilities are taken from http://en.wikipedia.org/wiki/Standard_normal_table
    // The table used is the cumulative, and not cumulative from 0 to mean
    // (even though the latter has 5 digits precision, instead of 4).
    var standard_normal_table = [
        /*  z      0.00    0.01    0.02    0.03    0.04    0.05    0.06    0.07    0.08    0.09 */
        /* 0.0 */
        0.5000, 0.5040, 0.5080, 0.5120, 0.5160, 0.5199, 0.5239, 0.5279, 0.5319, 0.5359,
        /* 0.1 */
        0.5398, 0.5438, 0.5478, 0.5517, 0.5557, 0.5596, 0.5636, 0.5675, 0.5714, 0.5753,
        /* 0.2 */
        0.5793, 0.5832, 0.5871, 0.5910, 0.5948, 0.5987, 0.6026, 0.6064, 0.6103, 0.6141,
        /* 0.3 */
        0.6179, 0.6217, 0.6255, 0.6293, 0.6331, 0.6368, 0.6406, 0.6443, 0.6480, 0.6517,
        /* 0.4 */
        0.6554, 0.6591, 0.6628, 0.6664, 0.6700, 0.6736, 0.6772, 0.6808, 0.6844, 0.6879,
        /* 0.5 */
        0.6915, 0.6950, 0.6985, 0.7019, 0.7054, 0.7088, 0.7123, 0.7157, 0.7190, 0.7224,
        /* 0.6 */
        0.7257, 0.7291, 0.7324, 0.7357, 0.7389, 0.7422, 0.7454, 0.7486, 0.7517, 0.7549,
        /* 0.7 */
        0.7580, 0.7611, 0.7642, 0.7673, 0.7704, 0.7734, 0.7764, 0.7794, 0.7823, 0.7852,
        /* 0.8 */
        0.7881, 0.7910, 0.7939, 0.7967, 0.7995, 0.8023, 0.8051, 0.8078, 0.8106, 0.8133,
        /* 0.9 */
        0.8159, 0.8186, 0.8212, 0.8238, 0.8264, 0.8289, 0.8315, 0.8340, 0.8365, 0.8389,
        /* 1.0 */
        0.8413, 0.8438, 0.8461, 0.8485, 0.8508, 0.8531, 0.8554, 0.8577, 0.8599, 0.8621,
        /* 1.1 */
        0.8643, 0.8665, 0.8686, 0.8708, 0.8729, 0.8749, 0.8770, 0.8790, 0.8810, 0.8830,
        /* 1.2 */
        0.8849, 0.8869, 0.8888, 0.8907, 0.8925, 0.8944, 0.8962, 0.8980, 0.8997, 0.9015,
        /* 1.3 */
        0.9032, 0.9049, 0.9066, 0.9082, 0.9099, 0.9115, 0.9131, 0.9147, 0.9162, 0.9177,
        /* 1.4 */
        0.9192, 0.9207, 0.9222, 0.9236, 0.9251, 0.9265, 0.9279, 0.9292, 0.9306, 0.9319,
        /* 1.5 */
        0.9332, 0.9345, 0.9357, 0.9370, 0.9382, 0.9394, 0.9406, 0.9418, 0.9429, 0.9441,
        /* 1.6 */
        0.9452, 0.9463, 0.9474, 0.9484, 0.9495, 0.9505, 0.9515, 0.9525, 0.9535, 0.9545,
        /* 1.7 */
        0.9554, 0.9564, 0.9573, 0.9582, 0.9591, 0.9599, 0.9608, 0.9616, 0.9625, 0.9633,
        /* 1.8 */
        0.9641, 0.9649, 0.9656, 0.9664, 0.9671, 0.9678, 0.9686, 0.9693, 0.9699, 0.9706,
        /* 1.9 */
        0.9713, 0.9719, 0.9726, 0.9732, 0.9738, 0.9744, 0.9750, 0.9756, 0.9761, 0.9767,
        /* 2.0 */
        0.9772, 0.9778, 0.9783, 0.9788, 0.9793, 0.9798, 0.9803, 0.9808, 0.9812, 0.9817,
        /* 2.1 */
        0.9821, 0.9826, 0.9830, 0.9834, 0.9838, 0.9842, 0.9846, 0.9850, 0.9854, 0.9857,
        /* 2.2 */
        0.9861, 0.9864, 0.9868, 0.9871, 0.9875, 0.9878, 0.9881, 0.9884, 0.9887, 0.9890,
        /* 2.3 */
        0.9893, 0.9896, 0.9898, 0.9901, 0.9904, 0.9906, 0.9909, 0.9911, 0.9913, 0.9916,
        /* 2.4 */
        0.9918, 0.9920, 0.9922, 0.9925, 0.9927, 0.9929, 0.9931, 0.9932, 0.9934, 0.9936,
        /* 2.5 */
        0.9938, 0.9940, 0.9941, 0.9943, 0.9945, 0.9946, 0.9948, 0.9949, 0.9951, 0.9952,
        /* 2.6 */
        0.9953, 0.9955, 0.9956, 0.9957, 0.9959, 0.9960, 0.9961, 0.9962, 0.9963, 0.9964,
        /* 2.7 */
        0.9965, 0.9966, 0.9967, 0.9968, 0.9969, 0.9970, 0.9971, 0.9972, 0.9973, 0.9974,
        /* 2.8 */
        0.9974, 0.9975, 0.9976, 0.9977, 0.9977, 0.9978, 0.9979, 0.9979, 0.9980, 0.9981,
        /* 2.9 */
        0.9981, 0.9982, 0.9982, 0.9983, 0.9984, 0.9984, 0.9985, 0.9985, 0.9986, 0.9986,
        /* 3.0 */
        0.9987, 0.9987, 0.9987, 0.9988, 0.9988, 0.9989, 0.9989, 0.9989, 0.9990, 0.9990
    ];

    // # [Cumulative Standard Normal Probability](http://en.wikipedia.org/wiki/Standard_normal_table)
    //
    // Since probability tables cannot be
    // printed for every normal distribution, as there are an infinite variety
    // of normal distributions, it is common practice to convert a normal to a
    // standard normal and then use the standard normal table to find probabilities
    function cumulative_std_normal_probability(z) {

        // Calculate the position of this value.
        var absZ = Math.abs(z),
            // Each row begins with a different
            // significant digit: 0.5, 0.6, 0.7, and so on. So the row is simply
            // this value's significant digit: 0.567 will be in row 0, so row=0,
            // 0.643 will be in row 1, so row=10.
            row = Math.floor(absZ * 10),
            column = 10 * (Math.floor(absZ * 100) / 10 - Math.floor(absZ * 100 / 10)),
            index = Math.min((row * 10) + column, standard_normal_table.length - 1);

        // The index we calculate must be in the table as a positive value,
        // but we still pay attention to whether the input is positive
        // or negative, and flip the output value as a last step.
        if (z >= 0) {
            return standard_normal_table[index];
        } else {
            // due to floating-point arithmetic, values in the table with
            // 4 significant figures can nevertheless end up as repeating
            // fractions when they're computed here.
            return +(1 - standard_normal_table[index]).toFixed(4);
        }
    }

    // # [Z-Score, or Standard Score](http://en.wikipedia.org/wiki/Standard_score)
    //
    // The standard score is the number of standard deviations an observation
    // or datum is above or below the mean. Thus, a positive standard score
    // represents a datum above the mean, while a negative standard score
    // represents a datum below the mean. It is a dimensionless quantity
    // obtained by subtracting the population mean from an individual raw
    // score and then dividing the difference by the population standard
    // deviation.
    //
    // The z-score is only defined if one knows the population parameters;
    // if one only has a sample set, then the analogous computation with
    // sample mean and sample standard deviation yields the
    // Student's t-statistic.
    function z_score(x, mean, standard_deviation) {
        return (x - mean) / standard_deviation;
    }

    // We use `ε`, epsilon, as a stopping criterion when we want to iterate
    // until we're "close enough".
    var epsilon = 0.0001;

    // # [Factorial](https://en.wikipedia.org/wiki/Factorial)
    //
    // A factorial, usually written n!, is the product of all positive
    // integers less than or equal to n. Often factorial is implemented
    // recursively, but this iterative approach is significantly faster
    // and simpler.
    function factorial(n) {

        // factorial is mathematically undefined for negative numbers
        if (n < 0 ) { return null; }

        // typically you'll expand the factorial function going down, like
        // 5! = 5 * 4 * 3 * 2 * 1. This is going in the opposite direction,
        // counting from 2 up to the number in question, and since anything
        // multiplied by 1 is itself, the loop only needs to start at 2.
        var accumulator = 1;
        for (var i = 2; i <= n; i++) {
            // for each number up to and including the number `n`, multiply
            // the accumulator my that number.
            accumulator *= i;
        }
        return accumulator;
    }

    // # Bernoulli Distribution
    //
    // The [Bernoulli distribution](http://en.wikipedia.org/wiki/Bernoulli_distribution)
    // is the probability discrete
    // distribution of a random variable which takes value 1 with success
    // probability `p` and value 0 with failure
    // probability `q` = 1 - `p`. It can be used, for example, to represent the
    // toss of a coin, where "1" is defined to mean "heads" and "0" is defined
    // to mean "tails" (or vice versa). It is
    // a special case of a Binomial Distribution
    // where `n` = 1.
    function bernoulli_distribution(p) {
        // Check that `p` is a valid probability (0 ≤ p ≤ 1)
        if (p < 0 || p > 1 ) { return null; }

        return binomial_distribution(1, p);
    }

    // # Binomial Distribution
    //
    // The [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution) is the discrete probability
    // distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields
    // success with probability `probability`. Such a success/failure experiment is also called a Bernoulli experiment or
    // Bernoulli trial; when trials = 1, the Binomial Distribution is a Bernoulli Distribution.
    function binomial_distribution(trials, probability) {
        // Check that `p` is a valid probability (0 ≤ p ≤ 1),
        // that `n` is an integer, strictly positive.
        if (probability < 0 || probability > 1 ||
            trials <= 0 || trials % 1 !== 0) {
            return null;
        }

        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        function probability_mass(x, trials, probability) {
            return factorial(trials) /
                (factorial(x) * factorial(trials - x)) *
                (Math.pow(probability, x) * Math.pow(1 - probability, trials - x));
        }

        // We initialize `x`, the random variable, and `accumulator`, an accumulator
        // for the cumulative distribution function to 0. `distribution_functions`
        // is the object we'll return with the `probability_of_x` and the
        // `cumulative_probability_of_x`, as well as the calculated mean &
        // variance. We iterate until the `cumulative_probability_of_x` is
        // within `epsilon` of 1.0.
        var x = 0,
            cumulative_probability = 0,
            cells = {};

        // This algorithm iterates through each potential outcome,
        // until the `cumulative_probability` is very close to 1, at
        // which point we've defined the vast majority of outcomes
        do {
            cells[x] = probability_mass(x, trials, probability);
            cumulative_probability += cells[x];
            x++;
        // when the cumulative_probability is nearly 1, we've calculated
        // the useful range of this distribution
        } while (cumulative_probability < 1 - epsilon);

        return cells;
    }

    // # Poisson Distribution
    //
    // The [Poisson Distribution](http://en.wikipedia.org/wiki/Poisson_distribution)
    // is a discrete probability distribution that expresses the probability
    // of a given number of events occurring in a fixed interval of time
    // and/or space if these events occur with a known average rate and
    // independently of the time since the last event.
    //
    // The Poisson Distribution is characterized by the strictly positive
    // mean arrival or occurrence rate, `λ`.
    function poisson_distribution(lambda) {
        // Check that lambda is strictly positive
        if (lambda <= 0) { return null; }

        // our current place in the distribution
        var x = 0,
            // and we keep track of the current cumulative probability, in
            // order to know when to stop calculating chances.
            cumulative_probability = 0,
            // the calculated cells to be returned
            cells = {};

        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        function probability_mass(x, lambda) {
            return (Math.pow(Math.E, -lambda) * Math.pow(lambda, x)) /
                factorial(x);
        }

        // This algorithm iterates through each potential outcome,
        // until the `cumulative_probability` is very close to 1, at
        // which point we've defined the vast majority of outcomes
        do {
            cells[x] = probability_mass(x, lambda);
            cumulative_probability += cells[x];
            x++;
        // when the cumulative_probability is nearly 1, we've calculated
        // the useful range of this distribution
        } while (cumulative_probability < 1 - epsilon);

        return cells;
    }

    // # Percentage Points of the χ2 (Chi-Squared) Distribution
    // The [χ2 (Chi-Squared) Distribution](http://en.wikipedia.org/wiki/Chi-squared_distribution) is used in the common
    // chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two
    // criteria of classification of qualitative data, and in confidence interval estimation for a population standard
    // deviation of a normal distribution from a sample standard deviation.
    //
    // Values from Appendix 1, Table III of William W. Hines & Douglas C. Montgomery, "Probability and Statistics in
    // Engineering and Management Science", Wiley (1980).
    var chi_squared_distribution_table = {
        1: { 0.995:  0.00, 0.99:  0.00, 0.975:  0.00, 0.95:  0.00, 0.9:  0.02, 0.5:  0.45, 0.1:  2.71, 0.05:  3.84, 0.025:  5.02, 0.01:  6.63, 0.005:  7.88 },
        2: { 0.995:  0.01, 0.99:  0.02, 0.975:  0.05, 0.95:  0.10, 0.9:  0.21, 0.5:  1.39, 0.1:  4.61, 0.05:  5.99, 0.025:  7.38, 0.01:  9.21, 0.005: 10.60 },
        3: { 0.995:  0.07, 0.99:  0.11, 0.975:  0.22, 0.95:  0.35, 0.9:  0.58, 0.5:  2.37, 0.1:  6.25, 0.05:  7.81, 0.025:  9.35, 0.01: 11.34, 0.005: 12.84 },
        4: { 0.995:  0.21, 0.99:  0.30, 0.975:  0.48, 0.95:  0.71, 0.9:  1.06, 0.5:  3.36, 0.1:  7.78, 0.05:  9.49, 0.025: 11.14, 0.01: 13.28, 0.005: 14.86 },
        5: { 0.995:  0.41, 0.99:  0.55, 0.975:  0.83, 0.95:  1.15, 0.9:  1.61, 0.5:  4.35, 0.1:  9.24, 0.05: 11.07, 0.025: 12.83, 0.01: 15.09, 0.005: 16.75 },
        6: { 0.995:  0.68, 0.99:  0.87, 0.975:  1.24, 0.95:  1.64, 0.9:  2.20, 0.5:  5.35, 0.1: 10.65, 0.05: 12.59, 0.025: 14.45, 0.01: 16.81, 0.005: 18.55 },
        7: { 0.995:  0.99, 0.99:  1.25, 0.975:  1.69, 0.95:  2.17, 0.9:  2.83, 0.5:  6.35, 0.1: 12.02, 0.05: 14.07, 0.025: 16.01, 0.01: 18.48, 0.005: 20.28 },
        8: { 0.995:  1.34, 0.99:  1.65, 0.975:  2.18, 0.95:  2.73, 0.9:  3.49, 0.5:  7.34, 0.1: 13.36, 0.05: 15.51, 0.025: 17.53, 0.01: 20.09, 0.005: 21.96 },
        9: { 0.995:  1.73, 0.99:  2.09, 0.975:  2.70, 0.95:  3.33, 0.9:  4.17, 0.5:  8.34, 0.1: 14.68, 0.05: 16.92, 0.025: 19.02, 0.01: 21.67, 0.005: 23.59 },
        10: { 0.995:  2.16, 0.99:  2.56, 0.975:  3.25, 0.95:  3.94, 0.9:  4.87, 0.5:  9.34, 0.1: 15.99, 0.05: 18.31, 0.025: 20.48, 0.01: 23.21, 0.005: 25.19 },
        11: { 0.995:  2.60, 0.99:  3.05, 0.975:  3.82, 0.95:  4.57, 0.9:  5.58, 0.5: 10.34, 0.1: 17.28, 0.05: 19.68, 0.025: 21.92, 0.01: 24.72, 0.005: 26.76 },
        12: { 0.995:  3.07, 0.99:  3.57, 0.975:  4.40, 0.95:  5.23, 0.9:  6.30, 0.5: 11.34, 0.1: 18.55, 0.05: 21.03, 0.025: 23.34, 0.01: 26.22, 0.005: 28.30 },
        13: { 0.995:  3.57, 0.99:  4.11, 0.975:  5.01, 0.95:  5.89, 0.9:  7.04, 0.5: 12.34, 0.1: 19.81, 0.05: 22.36, 0.025: 24.74, 0.01: 27.69, 0.005: 29.82 },
        14: { 0.995:  4.07, 0.99:  4.66, 0.975:  5.63, 0.95:  6.57, 0.9:  7.79, 0.5: 13.34, 0.1: 21.06, 0.05: 23.68, 0.025: 26.12, 0.01: 29.14, 0.005: 31.32 },
        15: { 0.995:  4.60, 0.99:  5.23, 0.975:  6.27, 0.95:  7.26, 0.9:  8.55, 0.5: 14.34, 0.1: 22.31, 0.05: 25.00, 0.025: 27.49, 0.01: 30.58, 0.005: 32.80 },
        16: { 0.995:  5.14, 0.99:  5.81, 0.975:  6.91, 0.95:  7.96, 0.9:  9.31, 0.5: 15.34, 0.1: 23.54, 0.05: 26.30, 0.025: 28.85, 0.01: 32.00, 0.005: 34.27 },
        17: { 0.995:  5.70, 0.99:  6.41, 0.975:  7.56, 0.95:  8.67, 0.9: 10.09, 0.5: 16.34, 0.1: 24.77, 0.05: 27.59, 0.025: 30.19, 0.01: 33.41, 0.005: 35.72 },
        18: { 0.995:  6.26, 0.99:  7.01, 0.975:  8.23, 0.95:  9.39, 0.9: 10.87, 0.5: 17.34, 0.1: 25.99, 0.05: 28.87, 0.025: 31.53, 0.01: 34.81, 0.005: 37.16 },
        19: { 0.995:  6.84, 0.99:  7.63, 0.975:  8.91, 0.95: 10.12, 0.9: 11.65, 0.5: 18.34, 0.1: 27.20, 0.05: 30.14, 0.025: 32.85, 0.01: 36.19, 0.005: 38.58 },
        20: { 0.995:  7.43, 0.99:  8.26, 0.975:  9.59, 0.95: 10.85, 0.9: 12.44, 0.5: 19.34, 0.1: 28.41, 0.05: 31.41, 0.025: 34.17, 0.01: 37.57, 0.005: 40.00 },
        21: { 0.995:  8.03, 0.99:  8.90, 0.975: 10.28, 0.95: 11.59, 0.9: 13.24, 0.5: 20.34, 0.1: 29.62, 0.05: 32.67, 0.025: 35.48, 0.01: 38.93, 0.005: 41.40 },
        22: { 0.995:  8.64, 0.99:  9.54, 0.975: 10.98, 0.95: 12.34, 0.9: 14.04, 0.5: 21.34, 0.1: 30.81, 0.05: 33.92, 0.025: 36.78, 0.01: 40.29, 0.005: 42.80 },
        23: { 0.995:  9.26, 0.99: 10.20, 0.975: 11.69, 0.95: 13.09, 0.9: 14.85, 0.5: 22.34, 0.1: 32.01, 0.05: 35.17, 0.025: 38.08, 0.01: 41.64, 0.005: 44.18 },
        24: { 0.995:  9.89, 0.99: 10.86, 0.975: 12.40, 0.95: 13.85, 0.9: 15.66, 0.5: 23.34, 0.1: 33.20, 0.05: 36.42, 0.025: 39.36, 0.01: 42.98, 0.005: 45.56 },
        25: { 0.995: 10.52, 0.99: 11.52, 0.975: 13.12, 0.95: 14.61, 0.9: 16.47, 0.5: 24.34, 0.1: 34.28, 0.05: 37.65, 0.025: 40.65, 0.01: 44.31, 0.005: 46.93 },
        26: { 0.995: 11.16, 0.99: 12.20, 0.975: 13.84, 0.95: 15.38, 0.9: 17.29, 0.5: 25.34, 0.1: 35.56, 0.05: 38.89, 0.025: 41.92, 0.01: 45.64, 0.005: 48.29 },
        27: { 0.995: 11.81, 0.99: 12.88, 0.975: 14.57, 0.95: 16.15, 0.9: 18.11, 0.5: 26.34, 0.1: 36.74, 0.05: 40.11, 0.025: 43.19, 0.01: 46.96, 0.005: 49.65 },
        28: { 0.995: 12.46, 0.99: 13.57, 0.975: 15.31, 0.95: 16.93, 0.9: 18.94, 0.5: 27.34, 0.1: 37.92, 0.05: 41.34, 0.025: 44.46, 0.01: 48.28, 0.005: 50.99 },
        29: { 0.995: 13.12, 0.99: 14.26, 0.975: 16.05, 0.95: 17.71, 0.9: 19.77, 0.5: 28.34, 0.1: 39.09, 0.05: 42.56, 0.025: 45.72, 0.01: 49.59, 0.005: 52.34 },
        30: { 0.995: 13.79, 0.99: 14.95, 0.975: 16.79, 0.95: 18.49, 0.9: 20.60, 0.5: 29.34, 0.1: 40.26, 0.05: 43.77, 0.025: 46.98, 0.01: 50.89, 0.005: 53.67 },
        40: { 0.995: 20.71, 0.99: 22.16, 0.975: 24.43, 0.95: 26.51, 0.9: 29.05, 0.5: 39.34, 0.1: 51.81, 0.05: 55.76, 0.025: 59.34, 0.01: 63.69, 0.005: 66.77 },
        50: { 0.995: 27.99, 0.99: 29.71, 0.975: 32.36, 0.95: 34.76, 0.9: 37.69, 0.5: 49.33, 0.1: 63.17, 0.05: 67.50, 0.025: 71.42, 0.01: 76.15, 0.005: 79.49 },
        60: { 0.995: 35.53, 0.99: 37.48, 0.975: 40.48, 0.95: 43.19, 0.9: 46.46, 0.5: 59.33, 0.1: 74.40, 0.05: 79.08, 0.025: 83.30, 0.01: 88.38, 0.005: 91.95 },
        70: { 0.995: 43.28, 0.99: 45.44, 0.975: 48.76, 0.95: 51.74, 0.9: 55.33, 0.5: 69.33, 0.1: 85.53, 0.05: 90.53, 0.025: 95.02, 0.01: 100.42, 0.005: 104.22 },
        80: { 0.995: 51.17, 0.99: 53.54, 0.975: 57.15, 0.95: 60.39, 0.9: 64.28, 0.5: 79.33, 0.1: 96.58, 0.05: 101.88, 0.025: 106.63, 0.01: 112.33, 0.005: 116.32 },
        90: { 0.995: 59.20, 0.99: 61.75, 0.975: 65.65, 0.95: 69.13, 0.9: 73.29, 0.5: 89.33, 0.1: 107.57, 0.05: 113.14, 0.025: 118.14, 0.01: 124.12, 0.005: 128.30 },
        100: { 0.995: 67.33, 0.99: 70.06, 0.975: 74.22, 0.95: 77.93, 0.9: 82.36, 0.5: 99.33, 0.1: 118.50, 0.05: 124.34, 0.025: 129.56, 0.01: 135.81, 0.005: 140.17 }
    };

    // # χ2 (Chi-Squared) Goodness-of-Fit Test
    //
    // The [χ2 (Chi-Squared) Goodness-of-Fit Test](http://en.wikipedia.org/wiki/Goodness_of_fit#Pearson.27s_chi-squared_test)
    // uses a measure of goodness of fit which is the sum of differences between observed and expected outcome frequencies
    // (that is, counts of observations), each squared and divided by the number of observations expected given the
    // hypothesized distribution. The resulting χ2 statistic, `chi_squared`, can be compared to the chi-squared distribution
    // to determine the goodness of fit. In order to determine the degrees of freedom of the chi-squared distribution, one
    // takes the total number of observed frequencies and subtracts the number of estimated parameters. The test statistic
    // follows, approximately, a chi-square distribution with (k − c) degrees of freedom where `k` is the number of non-empty
    // cells and `c` is the number of estimated parameters for the distribution.
    function chi_squared_goodness_of_fit(data, distribution_type, significance) {
        // Estimate from the sample data, a weighted mean.
        var input_mean = mean(data),
            // Calculated value of the χ2 statistic.
            chi_squared = 0,
            // Degrees of freedom, calculated as (number of class intervals -
            // number of hypothesized distribution parameters estimated - 1)
            degrees_of_freedom,
            // Number of hypothesized distribution parameters estimated, expected to be supplied in the distribution test.
            // Lose one degree of freedom for estimating `lambda` from the sample data.
            c = 1,
            // The hypothesized distribution.
            // Generate the hypothesized distribution.
            hypothesized_distribution = distribution_type(input_mean),
            observed_frequencies = [],
            expected_frequencies = [],
            k;

        // Create an array holding a histogram from the sample data, of
        // the form `{ value: numberOfOcurrences }`
        for (var i = 0; i < data.length; i++) {
            if (observed_frequencies[data[i]] === undefined) {
                observed_frequencies[data[i]] = 0;
            }
            observed_frequencies[data[i]]++;
        }

        // The histogram we created might be sparse - there might be gaps
        // between values. So we iterate through the histogram, making
        // sure that instead of undefined, gaps have 0 values.
        for (i = 0; i < observed_frequencies.length; i++) {
            if (observed_frequencies[i] === undefined) {
                observed_frequencies[i] = 0;
            }
        }

        // Create an array holding a histogram of expected data given the
        // sample size and hypothesized distribution.
        for (k in hypothesized_distribution) {
            if (k in observed_frequencies) {
                expected_frequencies[k] = hypothesized_distribution[k] * data.length;
            }
        }

        // Working backward through the expected frequencies, collapse classes
        // if less than three observations are expected for a class.
        // This transformation is applied to the observed frequencies as well.
        for (k = expected_frequencies.length - 1; k >= 0; k--) {
            if (expected_frequencies[k] < 3) {
                expected_frequencies[k - 1] += expected_frequencies[k];
                expected_frequencies.pop();

                observed_frequencies[k - 1] += observed_frequencies[k];
                observed_frequencies.pop();
            }
        }

        // Iterate through the squared differences between observed & expected
        // frequencies, accumulating the `chi_squared` statistic.
        for (k = 0; k < observed_frequencies.length; k++) {
            chi_squared += Math.pow(
                observed_frequencies[k] - expected_frequencies[k], 2) /
                expected_frequencies[k];
        }

        // Calculate degrees of freedom for this test and look it up in the
        // `chi_squared_distribution_table` in order to
        // accept or reject the goodness-of-fit of the hypothesized distribution.
        degrees_of_freedom = observed_frequencies.length - c - 1;
        return chi_squared_distribution_table[degrees_of_freedom][significance] < chi_squared;
    }

    // # Mixin
    //
    // Mixin simple_statistics to a single Array instance if provided
    // or the Array native object if not. This is an optional
    // feature that lets you treat simple_statistics as a native feature
    // of Javascript.
    function mixin(array) {
        var support = !!(Object.defineProperty && Object.defineProperties);
        if (!support) throw new Error('without defineProperty, simple-statistics cannot be mixed in');

        // only methods which work on basic arrays in a single step
        // are supported
        var arrayMethods = ['median', 'standard_deviation', 'sum',
            'sample_skewness',
            'mean', 'min', 'max', 'quantile', 'geometric_mean',
            'harmonic_mean', 'root_mean_square'];

        // create a closure with a method name so that a reference
        // like `arrayMethods[i]` doesn't follow the loop increment
        function wrap(method) {
            return function() {
                // cast any arguments into an array, since they're
                // natively objects
                var args = Array.prototype.slice.apply(arguments);
                // make the first argument the array itself
                args.unshift(this);
                // return the result of the ss method
                return ss[method].apply(ss, args);
            };
        }

        // select object to extend
        var extending;
        if (array) {
            // create a shallow copy of the array so that our internal
            // operations do not change it by reference
            extending = array.slice();
        } else {
            extending = Array.prototype;
        }

        // for each array function, define a function that gets
        // the array as the first argument.
        // We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
        // because it allows these properties to be non-enumerable:
        // `for (var in x)` loops will not run into problems with this
        // implementation.
        for (var i = 0; i < arrayMethods.length; i++) {
            Object.defineProperty(extending, arrayMethods[i], {
                value: wrap(arrayMethods[i]),
                configurable: true,
                enumerable: false,
                writable: true
            });
        }

        return extending;
    }

    ss.linear_regression = linear_regression;
    ss.standard_deviation = standard_deviation;
    ss.r_squared = r_squared;
    ss.median = median;
    ss.mean = mean;
    ss.mode = mode;
    ss.min = min;
    ss.max = max;
    ss.sum = sum;
    ss.quantile = quantile;
    ss.quantile_sorted = quantile_sorted;
    ss.iqr = iqr;
    ss.mad = mad;

    ss.chunk = chunk;
    ss.shuffle = shuffle;
    ss.shuffle_in_place = shuffle_in_place;

    ss.sample = sample;

    ss.sample_covariance = sample_covariance;
    ss.sample_correlation = sample_correlation;
    ss.sample_variance = sample_variance;
    ss.sample_standard_deviation = sample_standard_deviation;
    ss.sample_skewness = sample_skewness;

    ss.geometric_mean = geometric_mean;
    ss.harmonic_mean = harmonic_mean;
    ss.root_mean_square = root_mean_square;
    ss.variance = variance;
    ss.t_test = t_test;
    ss.t_test_two_sample = t_test_two_sample;

    // jenks
    ss.jenksMatrices = jenksMatrices;
    ss.jenksBreaks = jenksBreaks;
    ss.jenks = jenks;

    ss.bayesian = bayesian;

    // Distribution-related methods
    ss.epsilon = epsilon; // We make ε available to the test suite.
    ss.factorial = factorial;
    ss.bernoulli_distribution = bernoulli_distribution;
    ss.binomial_distribution = binomial_distribution;
    ss.poisson_distribution = poisson_distribution;
    ss.chi_squared_goodness_of_fit = chi_squared_goodness_of_fit;

    // Normal distribution
    ss.z_score = z_score;
    ss.cumulative_std_normal_probability = cumulative_std_normal_probability;
    ss.standard_normal_table = standard_normal_table;

    // Alias this into its common name
    ss.average = mean;
    ss.interquartile_range = iqr;
    ss.mixin = mixin;
    ss.median_absolute_deviation = mad;
    ss.rms = root_mean_square;

})(this);
;/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function(){L.labelVersion="0.2.1",L.Label=L.Class.extend({includes:L.Mixin.Events,options:{className:"",clickable:!1,direction:"right",noHide:!1,offset:[12,-15],opacity:1,zoomAnimation:!0},initialize:function(t,e){L.setOptions(this,t),this._source=e,this._animated=L.Browser.any3d&&this.options.zoomAnimation,this._isOpen=!1},onAdd:function(t){this._map=t,this._pane=this._source instanceof L.Marker?t._panes.markerPane:t._panes.popupPane,this._container||this._initLayout(),this._pane.appendChild(this._container),this._initInteraction(),this._update(),this.setOpacity(this.options.opacity),t.on("moveend",this._onMoveEnd,this).on("viewreset",this._onViewReset,this),this._animated&&t.on("zoomanim",this._zoomAnimation,this),L.Browser.touch&&!this.options.noHide&&L.DomEvent.on(this._container,"click",this.close,this)},onRemove:function(t){this._pane.removeChild(this._container),t.off({zoomanim:this._zoomAnimation,moveend:this._onMoveEnd,viewreset:this._onViewReset},this),this._removeInteraction(),this._map=null},setLatLng:function(t){return this._latlng=L.latLng(t),this._map&&this._updatePosition(),this},setContent:function(t){return this._previousContent=this._content,this._content=t,this._updateContent(),this},close:function(){var t=this._map;t&&(L.Browser.touch&&!this.options.noHide&&L.DomEvent.off(this._container,"click",this.close),t.removeLayer(this))},updateZIndex:function(t){this._zIndex=t,this._container&&this._zIndex&&(this._container.style.zIndex=t)},setOpacity:function(t){this.options.opacity=t,this._container&&L.DomUtil.setOpacity(this._container,t)},_initLayout:function(){this._container=L.DomUtil.create("div","leaflet-label "+this.options.className+" leaflet-zoom-animated"),this.updateZIndex(this._zIndex)},_update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updatePosition(),this._container.style.visibility="")},_updateContent:function(){this._content&&this._map&&this._prevContent!==this._content&&"string"==typeof this._content&&(this._container.innerHTML=this._content,this._prevContent=this._content,this._labelWidth=this._container.offsetWidth)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},_setPosition:function(t){var e=this._map,i=this._container,n=e.latLngToContainerPoint(e.getCenter()),o=e.layerPointToContainerPoint(t),s=this.options.direction,a=this._labelWidth,l=L.point(this.options.offset);"right"===s||"auto"===s&&o.x<n.x?(L.DomUtil.addClass(i,"leaflet-label-right"),L.DomUtil.removeClass(i,"leaflet-label-left"),t=t.add(l)):(L.DomUtil.addClass(i,"leaflet-label-left"),L.DomUtil.removeClass(i,"leaflet-label-right"),t=t.add(L.point(-l.x-a,l.y))),L.DomUtil.setPosition(i,t)},_zoomAnimation:function(t){var e=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPosition(e)},_onMoveEnd:function(){this._animated&&"auto"!==this.options.direction||this._updatePosition()},_onViewReset:function(t){t&&t.hard&&this._update()},_initInteraction:function(){if(this.options.clickable){var t=this._container,e=["dblclick","mousedown","mouseover","mouseout","contextmenu"];L.DomUtil.addClass(t,"leaflet-clickable"),L.DomEvent.on(t,"click",this._onMouseClick,this);for(var i=0;e.length>i;i++)L.DomEvent.on(t,e[i],this._fireMouseEvent,this)}},_removeInteraction:function(){if(this.options.clickable){var t=this._container,e=["dblclick","mousedown","mouseover","mouseout","contextmenu"];L.DomUtil.removeClass(t,"leaflet-clickable"),L.DomEvent.off(t,"click",this._onMouseClick,this);for(var i=0;e.length>i;i++)L.DomEvent.off(t,e[i],this._fireMouseEvent,this)}},_onMouseClick:function(t){this.hasEventListeners(t.type)&&L.DomEvent.stopPropagation(t),this.fire(t.type,{originalEvent:t})},_fireMouseEvent:function(t){this.fire(t.type,{originalEvent:t}),"contextmenu"===t.type&&this.hasEventListeners(t.type)&&L.DomEvent.preventDefault(t),"mousedown"!==t.type?L.DomEvent.stopPropagation(t):L.DomEvent.preventDefault(t)}}),L.BaseMarkerMethods={showLabel:function(){return this.label&&this._map&&(this.label.setLatLng(this._latlng),this._map.showLabel(this.label)),this},hideLabel:function(){return this.label&&this.label.close(),this},setLabelNoHide:function(t){this._labelNoHide!==t&&(this._labelNoHide=t,t?(this._removeLabelRevealHandlers(),this.showLabel()):(this._addLabelRevealHandlers(),this.hideLabel()))},bindLabel:function(t,e){var i=this.options.icon?this.options.icon.options.labelAnchor:this.options.labelAnchor,n=L.point(i)||L.point(0,0);return n=n.add(L.Label.prototype.options.offset),e&&e.offset&&(n=n.add(e.offset)),e=L.Util.extend({offset:n},e),this._labelNoHide=e.noHide,this.label||(this._labelNoHide||this._addLabelRevealHandlers(),this.on("remove",this.hideLabel,this).on("move",this._moveLabel,this).on("add",this._onMarkerAdd,this),this._hasLabelHandlers=!0),this.label=new L.Label(e,this).setContent(t),this},unbindLabel:function(){return this.label&&(this.hideLabel(),this.label=null,this._hasLabelHandlers&&(this._labelNoHide||this._removeLabelRevealHandlers(),this.off("remove",this.hideLabel,this).off("move",this._moveLabel,this).off("add",this._onMarkerAdd,this)),this._hasLabelHandlers=!1),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},getLabel:function(){return this.label},_onMarkerAdd:function(){this._labelNoHide&&this.showLabel()},_addLabelRevealHandlers:function(){this.on("mouseover",this.showLabel,this).on("mouseout",this.hideLabel,this),L.Browser.touch&&this.on("click",this.showLabel,this)},_removeLabelRevealHandlers:function(){this.off("mouseover",this.showLabel,this).off("mouseout",this.hideLabel,this),L.Browser.touch&&this.off("click",this.showLabel,this)},_moveLabel:function(t){this.label.setLatLng(t.latlng)}},L.Icon.Default.mergeOptions({labelAnchor:new L.Point(9,-20)}),L.Marker.mergeOptions({icon:new L.Icon.Default}),L.Marker.include(L.BaseMarkerMethods),L.Marker.include({_originalUpdateZIndex:L.Marker.prototype._updateZIndex,_updateZIndex:function(t){var e=this._zIndex+t;this._originalUpdateZIndex(t),this.label&&this.label.updateZIndex(e)},_originalSetOpacity:L.Marker.prototype.setOpacity,setOpacity:function(t,e){this.options.labelHasSemiTransparency=e,this._originalSetOpacity(t)},_originalUpdateOpacity:L.Marker.prototype._updateOpacity,_updateOpacity:function(){var t=0===this.options.opacity?0:1;this._originalUpdateOpacity(),this.label&&this.label.setOpacity(this.options.labelHasSemiTransparency?this.options.opacity:t)},_originalSetLatLng:L.Marker.prototype.setLatLng,setLatLng:function(t){return this.label&&!this._labelNoHide&&this.hideLabel(),this._originalSetLatLng(t)}}),L.CircleMarker.mergeOptions({labelAnchor:new L.Point(0,0)}),L.CircleMarker.include(L.BaseMarkerMethods),L.Path.include({bindLabel:function(t,e){return this.label&&this.label.options===e||(this.label=new L.Label(e,this)),this.label.setContent(t),this._showLabelAdded||(this.on("mouseover",this._showLabel,this).on("mousemove",this._moveLabel,this).on("mouseout remove",this._hideLabel,this),L.Browser.touch&&this.on("click",this._showLabel,this),this._showLabelAdded=!0),this},unbindLabel:function(){return this.label&&(this._hideLabel(),this.label=null,this._showLabelAdded=!1,this.off("mouseover",this._showLabel,this).off("mousemove",this._moveLabel,this).off("mouseout remove",this._hideLabel,this)),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},_showLabel:function(t){this.label.setLatLng(t.latlng),this._map.showLabel(this.label)},_moveLabel:function(t){this.label.setLatLng(t.latlng)},_hideLabel:function(){this.label.close()}}),L.Map.include({showLabel:function(t){return this.addLayer(t)}}),L.FeatureGroup.include({clearLayers:function(){return this.unbindLabel(),this.eachLayer(this.removeLayer,this),this},bindLabel:function(t,e){return this.invoke("bindLabel",t,e)},unbindLabel:function(){return this.invoke("unbindLabel")},updateLabelContent:function(t){this.invoke("updateLabelContent",t)}})})(this,document);;
    function number_format(number, decimals, dec_point, thousands_sep) {
        number = (number+'').replace(',', '').replace(' ', '');
        var n = !isFinite(+number) ? 0 : +number, 
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }

    function format(inte){
        var inte = inte.toString();
        var inte = inte.replace('.',',');   
        if(inte.charAt(3)!=''){
            inte = inte.slice(0,inte.length-3) + ' ' + inte.slice(inte.length-3,inte.length) 
        }   
        return(inte);
    }



var Legende = L.Control.extend({
    
    options: {
        position: 'bottomleft'
    },

    
    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    reverseArr: function (input) {
        var ret = new Array;
        for(var i = input.length-1; i >= 0; i--) {
            ret.push(input[i]);
        }
        return ret;
    },
    
          
    onAdd: function (map) {     
        jQuery("div.legend" ).remove();
        
        // create the control container with a particular class name
        var div =  L.DomUtil.create('div', 'legend');
        var color  =  this.options.couleurs.palette;
        var grades =  this.options.couleurs.grades;
        
        var npalette = color.slice(-grades.length);
        var html = new Array();
        
        i=0;
        src = "";
        src2 = "";
      
        var densiteh = this.options.couleurs.densiteh;
        var evolcreation = 0;
        var sep = ' - ';
       
        //cas pour filtre densité habitants
        /*if(($('#densite').is(':visible')) && ($('#densite select option:selected').val() == 'densiteh'))
            densiteh = 1;
        else if(($('#suggestion').is(':visible')) && ($('#suggestion select option:selected').val() == 'evolcreation'))
            sep = ' / ';*/

        //cas pas de classe 
        var i = grades.length - 1;
        
        if(grades.length < 5){          
            if(densiteh){
                var j=0;
                for(i;i>=0;i--,j++){
                        src = '<span style="background:'+npalette[j]+'"></span>';
                        src2 = '<label>' + format(grades[i]) + '</label>';
                        html.push({label:src2,couleur:src});
                    }  
            }
            else{
                for(i; i >= 0; i--){
                    src = '<span style="background:' + npalette[i] + '"></span>';
                    src2 = '<label>' + format(grades[i]) + '</label>';
                    
                    html.push({label:src2,couleur:src});
            }}
        }
        else{
            if(densiteh){
                  var j=0;
                  for(i; i > 0; i--, j++){
                      //si pas d'artisan   && grades[i-1] != 0   && i!=1
                      /*
                      if(grades[i] == 0 ){
                          alert(i);
                          alert(grades[i]);
                          src += '<span style="background:white"></span>';
                          src2 += '<label>Pas d\'artisan</label>';
                      }
                      */

                      if (grades[i - 1] == grades[i] || (grades[i - 1] == grades[i]-1 && i != grades.length-1))
                          src2 = '<label>' + format(grades[i-1]) + '</label>';
                      //si c'est la plus grande classe on affiche la vrai valeur de la borne supérieure
                      else if(i == grades.length-1 )
                          src2 = '<label>' + format(grades[i - 1]) + ' - ' +  format(grades[i]) + '</label>';
                      else
                          src2 = '<label>' + format(grades[i - 1]) + ' - ' +  format(grades[i]-1) + '</label>';
                        
                      src = '<span style="background:' + npalette[j] + '"></span>'; 
                      html.push({label:src2,couleur:src});
                  }     
              }
              else{
                  for(i; i > 0; i--){   
                      var leg = '';
                      // (si deux bornes de la classe sont égales) ou (different de 1 sans que ce soit la 1ere borne) on affiche que la deuxieme
                      if (grades[i - 1] == grades[i] || (grades[i - 1] == grades[i]-1) )
                          leg = format(grades[i-1]);
                      //si c'est la plus grande classe on affiche la vrai valeur de la borne superieure
                      else if(i == grades.length -1)
                          leg = format(grades[i - 1]) + sep +  format(grades[i]);
                      //-1 pour pas afficher le même nombre d'une classe à l'autre
                      else
                          leg = format(grades[i - 1]) + sep +  format(grades[i]-1) ;
                      // && i!=1 || (grades[i - 1] == grades[i]-1 && (i == grades.length - 1))  (format(grades[i - 1]) != 0?format(grades[i - 1])+1:format(grades[i - 1]))   (grades[i - 1]) != 0 &&
                                      
                      src = '<span style="background:' + npalette[i - 1] + '"></span>';
                      src2 = '<label>' + leg + '</label>';
                      html.push({label:src2,couleur:src});
                  }
              }           
        }

        var l = "", c = "";
        html.reverse().forEach(function(element) {
            l += element.label;
            c += element.couleur;
        });
        
        div.innerHTML += l +  "<br/>" + c;    
        return div;
     }
});






var Grades = (function() {
        
        //trie un tableau
        var sort = function sortC(arraytab) {
             return arraytab.sort(function(a, b) {
                return a - b;
             });
          }
        
        var reverseArr = function (input) {
            var ret = new Array;
            for(var i = input.length-1; i >= 0; i--) {
                ret.push(input[i]);
            }
            return ret;
        }
        
        
        // à partir du fichier geojson on créer un tableau (grades) contenant les valeurs limites des groupes 
        // où se répartissent l'ensemble des features geojson, chaque groupe correspondant à une couleur
        function Grades(result, densiteh){
            
        

            
            var arr = jQuery.map(result.features, function(o){ return o.properties.resultat._valeur; });
            
                var compt = 0;
                var grades = [];
                while((result['features'][compt]) != undefined){

                    if(jQuery.inArray(result['features'][compt]['properties']['resultat']['_valeur'], grades) == -1){
                        grades.push(result['features'][compt]['properties']['resultat']['_valeur']);                        
                    }                   
                    compt++;
                }

                grades = sort(grades);
                //s'il y a plus de 5 valeurs de features differentes on utilise la classification de jenks
                if(grades.length > 5){
                    
                    
                     if(densiteh){

                        var part = Math.round(grades.length/4);
                        var tab = [grades[0]];
                        var step = part-1;
                        while(grades[step] != undefined){
                            tab.push(grades[step]);
                            step += part;
                        }
                        if(tab.length!=5){
                            tab.push(grades[grades.length-1]);
                        }
                        if(tab[tab.length-1]!=grades[grades.length-1]){
                            tab[tab.length-1] = grades[grades.length-1];
                        }
                        grades = tab;
                    }
                    else{
                        //sinon classification de jenks                     
                        grades = ss.jenks(arr, 4);
                        //pour les 4 1eres valeurs de grades si deux valeurs qui se suivent st egales on incremente la 2eme sinon la premiere sera ds le 2eme groupe
                        for(var i=0; i < 4; i++){
                            if(grades[i]==grades[i+1]){
                                grades[i+1]++;
                            }
                        }
                    }
                
                }
                
                this.grades = grades;
        }
      
        return Grades;

}());



var Couleur = (function () {
        
        var defaults = {
                "coldefault"   : ['#B2DFDB','#4DB6AC',' #00897B','#004D40'],
                "Alimentation" : ['#bbdefb','#64b5f6','#1e88e5','#0d47a1'],
                "Batiment"     : ['#ffe0b2', '#ffb74d', '#ff9800', '#ef6c00'],
                "Fabrication"  : ['#ffccbc', '#ff7043', '#e64a19', '#bf360c'],    
                "Services"     : ['#c8e6c9', '#66bb6a', '#388e3c', '#1b5e20'],
                "secteur"      : "coldefault"
        }
        

        //à partir du tableau grades
        function Couleur(result, secteur){
            
            this.densiteh = (result.statistique.resultat[0]._nom == "Habitants pour 1 établissement");
            
            var features = $.map(result.features, function(o){ if(o.properties.resultat._valeur != 'IMPOSSIBLE') return o });

            var nresult = {'features' : features};
            
        

            var objgrades = new Grades(nresult, this.densiteh);
            this.grades = objgrades.grades;
            this.palette = getPalette(secteur);
            
            this.npalette = this.palette.slice(-this.grades.length);
        } 
        
        
        // retourne une palette de couleur en fonction d'un secteur
        var getPalette = function(secteur){

            switch(secteur){
                case 'Alimentation':
                    var palette = defaults.Alimentation;break;
                case "Bâtiment":
                    var palette = defaults.Batiment;break;
                case 'Fabrication':
                    var palette = defaults.Fabrication;break;
                case 'Services':
                    var palette = defaults.Services;break;
                default:
                    var palette = defaults.coldefault;
            }
            
            return palette;
        }
        
        //retourne la couleur d'une feature geojson (une commune par exemple) en fonction de grades
        Couleur.prototype.getcol = function (value){
            
            if(value == 'IMPOSSIBLE'){
                return '#dedede';
            }
            
            var j = 0;
            
              if(this.grades.length < 5){
                   j = this.grades.length - 1;
              }else{
                   j = this.grades.length - 2;  
              }
              
              
              if(this.densiteh){
                  

                  //si pas d'artisan
                    var i = 0;
                    while (!(value >= this.grades[j])){
                        i++;
                        j--;
                    }
                    return this.npalette[i];      
                  
              }
              
              //cas pour filtre densité habitants
             
 
            //chaque groupe de grades correspond à une valeur de la palette : on cherche à quel groupe de grades appartient la valeur pour trouver sa couleur
                  while (!(value >= this.grades[j])){
                      j--;                
                  }   
                  
                  //return this.palette[j]; 
                  
                
                  
                  /*console.log("npalette[j]");
                  console.log(npalette[j]);*/
                  
                  return this.npalette[j];                
        }
        return Couleur;

}());










(function($) {
    

    $.geometiers = function(element, options) {


        // Options défaut
        var defaults = {
            
            // token access
            accessToken : "pk.eyJ1IjoiYXJ0ODIiLCJhIjoic3hwSDFJRSJ9.D82gjhYrYR935Knj8cNVwg",
            
            // login map
            mapLogin : 'art82.5d30wpk0',

            // css
            urlstyle: "cixlnex77000s2sntu1jcfn6o",
            
            // latitude defaut du fond de carte
            lat : '44.01667',
            
            // longitude defaut du fond de carte
            lng : '1.35',
            
            // opacity defaut
            opacity: 1,

            // affichage des tiles
            displayTiles:false,
            
            // zoom defaut
            zoom: 8,
            
            // max zoom defaut
            maxZoom: 14,
            
            // Critère a affectés
            filtres : new Array(),    
           
            // Affichage des pins 
            arttruefalse : false, 
            
            // Couleurs des contours et backgrounds des zones
            colorLayerContour     : '#ffffff',
            colorLayerContourOver : '#ffffff',
            colorLayerBackground  : '#1a1a1a',
            colorContourArtisan   : '#FFC107',
            zoomLimitDisplayPopup : 10,
            
            // Zone sélectionnée par defaut
            zoneSelect : {name:'departement', value:'1'},
           
            // Découpage de la zone sélectionné
            decoupage :  {name:'decoupage', value:'arrondissement'},
            
            // Evenements
            initParent:null,
            update:null,
            updateMap:null,
            changeDatas:null,
            find:null,
            selectDecoupage:null,
            selectBreadcrumb:null,
            selectZone:null,
            selectAffichePins:null,
            
            // fonctions
            navigationControl : false,
            decoupeControl : false,
            legendeDisplay : false

        }
        
        // Plugin réference
        var plugin = this;
        plugin.settings = {}
        var $element = $(element),  // reference to the jQuery version of DOM element the plugin is attached to
               element = element;   // reference to the actual DOM element
        
        // fond de carte
        var carte;
        
        // Palette de couleur pour définir la légende/ou couleur simple permettant de colorier les territoires. 
        var couleurs = null;
        
        // liste de groupe layer (objets geojson)
        var listeGeoJson = new Array();
        
        // Liste de layer sélectionné
        var listeLayersSelect = new Array();
        
        // decoupage, zone initiale
        var decoupageInit,zoneSelectInit;
        
        // Conserve l'etat des sélections pour générer un fil d'arianne
        var listeEtapes = new Array();

        // parent group;
        var parent = new L.FeatureGroup();

        // marker
        var affichePins;

        // Initialisation du plugin
        plugin.init = function() {

            plugin.settings = $.extend({}, defaults, options);
            console.log('geometiers plugin init !');
          
            plugin.settings.decoupageInit  = plugin.settings.decoupage;

            plugin.settings.decoupage = {name:'decoupage',value:plugin.settings.decoupage};

            // Initialisation de la carte
            carte = new L.Map($element.attr("id"), {
                  zoomControl: false,
                  minZoom: 9,
                  maxZoom: 16, 
                  attributionControl: false,
                  dragging: true,
                  scrollWheelZoom: true,
                  doubleClickZoom: true,
                  boxZoom: true,
                  tap: true
            });


        }


 
        // Initialise le territoire racine
        plugin.parent = function(datas) {
            
            geojson = L.geoJson(datas, {
                style :function (feature) {
                    return {
                        fillColor: plugin.settings.colorLayerBackground,
                        weight: 0,
                        opacity: 0,
                        color: '#000000',
                        fillOpacity:1
                    };
                }
            });
            parent.clearLayers();
            parent.addLayer(geojson);
            parent.addTo(carte);

            var coord = parent.getBounds().getCenter();

            // init coordonnée parent
            plugin.settings.lat = coord.lat;
            plugin.settings.lng = coord.lng;

            carte.setView([coord.lat, coord.lng], plugin.settings.zoom);
            carte.setMaxBounds(carte.getBounds());


            var datas = plugin.datas();
            
            if(plugin.settings.initParent)plugin.settings.initParent(datas);
        }


       /* plugin.setPinsPosition = function(){

        }*/

        
        // si filtre particulier
        plugin.isDensiteh = function(){
            return plugin.getDatasItem('stats') != undefined 
                    && plugin.getDatasItem('stats').value == 'densiteh';
        }
        
        
        // Retourne un tableau de critères à envoyer au controleur pour générer le GeoJSON
        // On concatène les filtres, le territoire sélectionné, le découpage, le controleur
        plugin.datas = function(){
            return $.unique(plugin.settings.filtres.concat(plugin.settings.zoneSelect,
                    plugin.settings.decoupage
            ));
        }
        
        // Retourne un item de la liste de données
        // itemName, nom de l'item à rechercher
        plugin.getDatasItem = function(itemName){
            var datas = plugin.datas();
            var val = datas.filter(function(item) { return item.name === itemName; });
            return (val != undefined)?val[0]:false;
        }
        
        
        // Filtrage des données
        plugin.setFiltres = function(filtres){
            if(filtres)plugin.settings.filtres = filtres;
        }
        

        
        plugin.rechercher = function(result,territoire){
            deleteAllLayersOfTheMap();
            carte.setView([plugin.settings.lat, plugin.settings.lng], plugin.settings.zoom);
            
            //plugin.settings.zoneSelect = {name:"departement",value:'1'};
            plugin.settings.decoupage = {name:"decoupage",value:'commune'};

            geojson = L.geoJson(result, {
                    style : {weight: 1, 
                        opacity: 1,
                        color: plugin.settings.colorLayerContour, 
                        fillOpacity: 1, 
                        fillColor: '#BDBDBD'
                        },
            onEachFeature : initEvenement}).addTo(carte);
            
            listeGeoJson.push(geojson);
            
            var layer = getLayerListeGeoJson(territoire.value,territoire.name);

            if(layer != null){
                setTimeout(function(){
                    // on active le click pour le territoire recherché
                    layer.on('click', zoom);
                    layer.fireEvent('click');
                    }, 500);
            }
        }
        
        

        
        ////////////////////////////////////////////////////////////////////////////////////
        // dessiner les layers
        // @param result, tableau GeoJson, contenant les territoire à dessiner
        // @param layer, layer sélectionné
        ////////////////////////////////////////////////////////////////////////////////////
        plugin.dessiner = function(result,layer) {
    
            if(layer != undefined && layer != null){
               
                // On reinitialise la sélection précédente
                resetStylelisteLayersSelect(layer);
                layer.off('mouseout', mouseOut);
                layer.off('mouseover', mouseOver);
                layer.off('click', zoom);

                // On récupère l'indice du groupe auquel appartient la zone sélectionné
                var indiceGroupeLayer = getIndiceGroupeLayers(layer);
                // On initialise la liste de Layer avec l'indice
                listeLayersSelect[indiceGroupeLayer] = layer;
                // On supprime les groupes au dessus du layer selectionné
                supprimerGroupeLayersTop(layer);
                // On applique un style au calque non sélectionné mais selectionnable
                resetStyleGroupeLayers();
            
                // On cache le layer sélectionner
                layer.setStyle({weight: 3,fillOpacity:0, color:plugin.settings.colorLayerContourOver});
                
                //ZOOM uniquement en mode mobile
                carte.fitBounds(layer.getBounds(),{maxZoom : 11});
                
                // update breadcrumb
                if(plugin.settings.navigationControl)
                updateBreadcrumb(layer);

            }
            else{
                //on a changé les filtres
                //si ce n'est pas l'initialisation
                if(listeGeoJson[listeGeoJson.length - 1] != undefined){
                    listeGeoJson[listeGeoJson.length - 1].clearLayers();
                    listeGeoJson.pop();
                }
            }

            // On initialise une nouvelle palette de couleur en fonction d'un secteur
            if(plugin.getDatasItem('secteur') != undefined){
                var secteur = plugin.getDatasItem('secteur');
                couleurs = new Couleur(result, secteur.value);
            }
            else
                couleurs = new Couleur(result);

            // Objet geojson
            geojson = L.geoJson(result, {style : appliquerStyle});
            var nbrDeLayers = geojson.getLayers().length;

            var newgroupe = L.featureGroup();
            newgroupe.addTo(carte);
            listeGeoJson.push(newgroupe);   
            // on ajoute les layers
            addLayersToMap(0,nbrDeLayers);
            
            // Callback update
            if(plugin.settings.update)plugin.settings.update(result.statistique);
            
            // update decoupage
            if(plugin.settings.decoupeControl)updateSelectionDecoupage();
            
            // update legende
            if(plugin.settings.legendeDisplay){
                legende = new Legende({'couleurs':couleurs}); 
                legende.addTo(carte);
            }


        }
        
        
        
        
        // Méthode privée /////////////////////////////
        // Initialise les évènements pour le territoire 
        var initEvenement = function(feature,layer) {   
            if(!L.Browser.touch ||!L.Browser.mobile){
                    layer.on({mouseover: mouseOver, mouseout: mouseOut, click: zoom,
                })
                .bindLabel( "geo", { className:'labelZone', direction: 'auto', offset:[50, -10] });
            }
            else{
                layer.on({mouseover: mouseOver,mouseout: mouseOut,click: zoom})
            }
        }
          
          
        // Définie un style pour un territoire
        var appliquerStyle = function(feature) {
                return {weight: 1, 
                    opacity: 1,
                    color: plugin.settings.colorLayerContour, 
                    fillOpacity: 1, 
                    fillColor: couleurs.getcol(feature.properties.resultat._valeur)};
        }
           
        
        // Ajoutes les calques à la carte
        var addLayersToMap = function (i,nbrDeLayers) {           
           //setTimeout(function () {  
               
              if(geojson.getLayers()[i] != undefined)
                  listeGeoJson[listeGeoJson.length - 1].addLayer(geojson.getLayers()[i]);
               
              i++;   
              if (i < nbrDeLayers) {            
                  addLayersToMap(i,nbrDeLayers);             
              }
              else{
                  listeGeoJson[listeGeoJson.length - 1].eachLayer(function (layer) {  
                      initEvenement(undefined,layer);
                  });
                  if(plugin.settings.updateMap)plugin.settings.updateMap();
              }
           //},0); // delay between layer adds in milliseconds
        }
        
        
        // Evenement déclencher lors du survol de la souris sur une territoire
        var mouseOver = function(e) {
            var layer = e.target;
            
            if(appartenirAZoneSelect(layer)){

                layer.setStyle({weight: 3, opacity:1, color: plugin.settings.colorLayerContourOver});
            
            }
            else{
                
                layer.setStyle({
                    fillColor: "#BDBDBD",
                    weight: 1, opacity: 1, 
                
                    fillOpacity: 1
                    });
            }
                    
            if (!L.Browser.ie && !L.Browser.opera) {
                // On met le calque devant
                layer.bringToFront(); 
            }

            $('.leaflet-label.labelZone').html(getHTMLContentPopupLayer(layer));
        }
        
        
        // Evenement déclencher lors de la sortie de la souris 
        var mouseOut = function(e) {
            var layer = e.target;
            if(appartenirAZoneSelect(layer)){
                layer.setStyle({weight: 1, opacity: 1,color: plugin.settings.colorLayerContour});
            }   
            else{
                
                layer.setStyle({
                    fillColor: plugin.settings.colorLayerBackground,
                    weight: 1, opacity: 1, 
                    color: plugin.settings.colorLayerContour,
                    fillOpacity: 1
                    });
                
                
                //fillColor: plugin.settings.colorLayerBackground, weight: 1, opacity: 0.1, color: '#000000', fillOpacity: 1weight: 1, opacity: 0,color: plugin.settings.colorLayerContour});
            }
        }
        

        // Evenement lors du click sur un territoire 
        var zoom = function(e) {
            
            var layer = e.target;

            // on verifie que la zone sélectionner n'est pas celle en cour
            if(similaireAZoneSelect(layer)){
                 // Init datas pour requête
                 var datas = plugin.datas();
                 if(plugin.settings.selectZone)plugin.settings.selectZone(datas,null);
            }
            else {
                // Initialise la zone sélectionné
                plugin.settings.zoneSelect = {name:layer.feature.properties.type,value:layer.feature.properties.code};
                // Init affichage des pins NON
                plugin.settings.arttruefalse = false;
                
                if(layer.feature.properties.type == "departement"){
                    plugin.settings.decoupage = {name:'decoupage',value:'pays'};    
                }
                else if(layer.feature.properties.type == "pays"){
                    plugin.settings.decoupage = {name:'decoupage',value:'epci'};    
                }
                else if(layer.feature.properties.type == "epci" 
                    || layer.feature.properties.type == "canton" 
                    || layer.feature.properties.type == "arrondissement"){
                    plugin.settings.decoupage = {name:'decoupage',value:'commune'}; 
                }
                
                // Init datas pour requête
                var datas = plugin.datas();
                if(plugin.settings.selectZone)plugin.settings.selectZone(datas,layer);
            }
  
        }
        

        
        /**
         * Retourne un contenu HTML générer à afficher dans une popup pour le survol d'une zone
         * var layer : layer survolé
         */
        var getHTMLContentPopupLayer = function(layer){
            
            var htmlContentPopup = "";
            
            var htmlContentPopup = '<h4>' + layer.feature.properties.typeDeTerritoire + '</h4>'
            + '<h1>' + layer.feature.properties.nom + '</h1>';
            
            // on affiche les données filtrés dans la popup uniquement pour les zones sélectionnées
            // On regarde si le type du parent du layer correspond au type de la derniere zone sélectionné
            if(appartenirAZoneSelect(layer)){

                if(layer.feature.properties.resultat._valeur == 'IMPOSSIBLE')
                    htmlContentPopup += "<span class='error'>Pas d'établissement</span>";   
                else
                    htmlContentPopup += '<span class="nbrFiltrer">' + number_format(layer.feature.properties.resultat._valeur,0,' ', ' ') + '</span> ' + layer.feature.properties.resultat._type;   
                    
                htmlContentPopup += '<p class="filtresListes">'+layer.feature.properties.resultat._nom +'<br/>';
                    
                    for(var i in layer.feature.properties.resultat._filtres)
                        htmlContentPopup += layer.feature.properties.resultat._filtres[i]._nom +'<br/>';
                    
                    htmlContentPopup += '</p>'
                    
            }   
  
            return htmlContentPopup;
        }
        
        
        // Retourne l'indice du groupe auquel appartient le layer
        var getIndiceGroupeLayers = function(layer){
            
            var indice = 0;
            var find = false;

            while (find == false && indice < listeGeoJson.length) {
                 if(listeGeoJson[indice].hasLayer(layer)){

                     find = true
                 }
                 else    
                     indice++;

            }

            return indice;
        }
        
        
        // Supprime les groupes de layers au dessus de celui sélectionné
        var supprimerGroupeLayersTop = function(layer){
        
            var indice = getIndiceGroupeLayers(layer);
            var tab = listeGeoJson.slice(indice+1);
            var k = 0;

            while (k < tab.length) {
                listeGeoJson.pop(tab[k]);
                tab[k].clearLayers();
                
                // On augmente k de 1.
                k++;
            }
        }
        
        
        // Supprime tous les layers de la carte et reset listeGeoJson, listeLayersSelect
        var deleteAllLayersOfTheMap = function(){
            
             var k = 0;
                while (k < listeGeoJson.length) {
                    listeGeoJson[k].clearLayers();
                    k++;
                }

                listeGeoJson = new Array();
                listeLayersSelect = new Array();
        }
        
        
        
        // Retourne un layer appartenant à la listeGeoJson dessiné
        // code de l'objet à chercher, type de l'objet à chercher
        var getLayerListeGeoJson = function(code,type){
            var layer = null;
            for(var i = 0;  i < listeGeoJson.length; i++){
                listeGeoJson[i].eachLayer(function(l){
                    if(l.feature.properties.type == type && l.feature.properties.code == code)
                        layer = l;
               });
            }
            
            if(layer != null && plugin.settings.find)
                plugin.settings.find(layer);

            return layer;
        }
        
        // vérifie si un calque appartient à la zone Sélectionné
        var appartenirAZoneSelect = function(layer){
            // On regarde si le type du parent du layer correspond au type de la derniere zone sélectionné
            return(layer != undefined && layer.feature.properties.parent.type == plugin.settings.zoneSelect.name 
                && layer.feature.properties.parent.code == plugin.settings.zoneSelect.value);
        }

        // vérifie si un calque est déjà la zone Sélectionnée
        var similaireAZoneSelect = function(layer){
            return(layer != undefined && layer.feature.properties.type == plugin.settings.zoneSelect.name 
                && layer.feature.properties.code == plugin.settings.zoneSelect.value);
        }
         

        // Applique un style par défaut au groupes
        var resetStyleGroupeLayers = function(){
            for(var i = 0; i < listeGeoJson.length; i++){
                listeGeoJson[i].eachLayer(function(layer){
                layer.setStyle({ fillColor: plugin.settings.colorLayerBackground, weight: 1, opacity: 1, color: plugin.settings.colorLayerContour, fillOpacity: 1});
               });
            }
        }

        
        // reinitialise la liste des calques sélectionné
        var resetStylelisteLayersSelect = function(layer){
            var indice = getIndiceGroupeLayers(layer);
            var tab = listeLayersSelect.slice(indice);
            var k = 0;
            var layer;

            while (k < tab.length) {
                layer = tab[k];
                layer.setStyle({ fillColor: plugin.settings.colorLayerBackground, weight: 1, opacity: 1, color: plugin.settings.colorLayerContour, fillOpacity: 0.5});
                layer.on('mouseout', mouseOut);
                layer.on('mouseover', mouseOver);
                layer.on('click', zoom);
                // On augmente k de 1.
                k++;
            }
        }
        
        
        // Met à jour les étapes de la navigation des types de territoire sélectionnés
       /*var updateBreadcrumb = function(layer){
            
            if(carte.hasLayer(affichePins)){
                    carte.removeLayer(affichePins);
            }

            if(layer.feature.properties.type == "commune"){

                var latLng = layer.getBounds().getCenter();

                var LeafIcon = L.Icon.extend({
                  options: {
                    texte: '',
                    iconSize:     [200, 40], // size of the icon
                    shadowAnchor: [0, 0],  // the same for the shadow
                    className: 'pins-div-icon',
                    iconAnchor:   [0, 0],
                  },
                  createIcon: function () {
                    var div = document.createElement('div');
                    var numdiv = document.createElement('p');
                    numdiv.innerHTML = this.options['texte'] || '';
                    div.appendChild ( numdiv );
                    this._setIconStyles(div, 'icon');
                    return div;
                 }});

                var myicon = new LeafIcon({texte: 'Voir les établissements'});
                affichePins = L.marker(latLng,{icon:myicon}).setLatLng(latLng).addTo(carte);

            } 
          


            $('#jq-dropdown-navigation').removeClass('open');
            $('#jq-dropdown-navigation').empty();
            
            //var button = $('<button id="btn-navigation"  class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent">nnnn</button>');

            //var button = $('<button id="btn-navigation" class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">&#xE5C4;</i></button>')
            var button = $('<button id="btn-navigation" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE5C4;</i></button>')
    


            var ul = $('<ul />')
                    .addClass('dropdown-menu');
                    //.attr('for', 'btn-navigation');

            
            var i = getIndiceGroupeLayers(layer);

            listeEtapes.splice(i+1, listeEtapes.length);
            
            var etape = $('<li/>').addClass('mdl-menu__item')
            .attr('data-type', layer.feature.properties.parent.type)
            .attr('data-code', layer.feature.properties.parent.code)
            .text(layer.feature.properties.parent.nom);

            listeEtapes[i] = etape;

            for (var i = listeEtapes.length-1; i >= 0; i--)
                listeEtapes[i].appendTo(ul);

            button.appendTo($('#jq-dropdown-navigation'));
            ul.appendTo($('#jq-dropdown-navigation'));
            
            componentHandler.upgradeElement(button.get(0));
            componentHandler.upgradeElement(ul.get(0));
            
            $('#jq-dropdown-navigation li').on('click', function(e) {
                
                 if(carte.hasLayer(affichePins)){
                    carte.removeLayer(affichePins);
                }

                
                var layer = getLayerListeGeoJson($(this).data('code'),$(this).data('type'));
                
                // si on a des étapes
                if(layer != null){
                    // on active le click pour le territoire recherché
                    layer.on('click', zoom);
                    layer.fireEvent('click');
                }
                // Sinon on retourne à l'étape d'accueil
                else{
                    
                    deleteAllLayersOfTheMap();
                      carte.setView([plugin.settings.lat, plugin.settings.lng], plugin.settings.zoom);
                            
                    //map.fitBounds(bounds);
                    $('#jq-dropdown-navigation').empty();
                    // Initialise la zone sélectionné
                    plugin.settings.zoneSelect = {name:$(this).data('type'),value:$(this).data('code')};
                    plugin.settings.decoupage = {name:"decoupage",value:plugin.settings.decoupageInit};

                    //plugin.settings.decoupage = plugin.settings.decoupageInit;
                    
                    var datas = plugin.datas();
                    if(plugin.settings.selectBreadcrumb)plugin.settings.selectBreadcrumb(datas);
                    
                }



            });

        }*/
        
        
        // Met à jour les étapes de la navigation des types de territoire sélectionnés
       var updateBreadcrumb = function(layer){
            
            if(carte.hasLayer(affichePins)){
                    carte.removeLayer(affichePins);
            }

            if(layer.feature.properties.type == "commune"){

                var latLng = layer.getBounds().getCenter();

                var LeafIcon = L.Icon.extend({
                  options: {
                    texte: '',
                    iconSize:     [200, 40], // size of the icon
                    shadowAnchor: [0, 0],  // the same for the shadow
                    className: 'pins-div-icon',
                    iconAnchor:   [0, 0],
                  },
                  createIcon: function () {
                    var div = document.createElement('div');
                    var numdiv = document.createElement('p');
                    numdiv.innerHTML = this.options['texte'] || '';
                    div.appendChild ( numdiv );
                    this._setIconStyles(div, 'icon');
                    return div;
                 }});

                var myicon = new LeafIcon({texte: 'Voir les établissements'});
                affichePins = L.marker(latLng,{icon:myicon}).setLatLng(latLng).addTo(carte);

                affichePins.on('click', function(e) {
                    if(plugin.settings.selectAffichePins)plugin.settings.selectAffichePins(layer);
                })    

            } 
          


            $('#jq-dropdown-navigation').removeClass('open');
            $('#jq-dropdown-navigation').empty();
            
            var button = $('<button id="btn-navigation" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE5C4;</i></button>')


            var i = getIndiceGroupeLayers(layer);
            listeEtapes.splice(i+1, listeEtapes.length);
            
            //var etape = $('<li/>').addClass('mdl-menu__item')
            button.attr('data-type', layer.feature.properties.parent.type);
            button.attr('data-code', layer.feature.properties.parent.code);
            //.text(layer.feature.properties.parent.nom);

            //listeEtapes[i] = etape;

           // for (var i = listeEtapes.length-1; i >= 0; i--)
             //   listeEtapes[i].appendTo(ul);

            button.appendTo($('#jq-dropdown-navigation'));
            //ul.appendTo($('#jq-dropdown-navigation'));
            
            componentHandler.upgradeElement(button.get(0));
           // componentHandler.upgradeElement(ul.get(0));
            
            $('#jq-dropdown-navigation button').on('click', function(e) {
                
                if(carte.hasLayer(affichePins)){
                    carte.removeLayer(affichePins);
                }

                var layer = getLayerListeGeoJson($(this).data('code'),$(this).data('type'));
                
                // si on a des étapes
                if(layer != null){
                    // on active le click pour le territoire recherché
                    layer.on('click', zoom);
                    layer.fireEvent('click');
                }
                // Sinon on retourne à l'étape d'accueil
                else{
                    
                    deleteAllLayersOfTheMap();
                      carte.setView([plugin.settings.lat, plugin.settings.lng], plugin.settings.zoom);
                            
                    //map.fitBounds(bounds);
                    $('#jq-dropdown-navigation').empty();
                    // Initialise la zone sélectionné
                    plugin.settings.zoneSelect = {name:$(this).data('type'),value:$(this).data('code')};
                    plugin.settings.decoupage = {name:"decoupage",value:plugin.settings.decoupageInit};

                    //plugin.settings.decoupage = plugin.settings.decoupageInit;
                    
                    var datas = plugin.datas();
                    if(plugin.settings.selectBreadcrumb)plugin.settings.selectBreadcrumb(datas);
                    
                }



            });

        }

       
        
        // Retourne une boite de sélection HTML pour le découpage
        var updateSelectionDecoupage = function(){

            $('#jq-dropdown-decoupe').removeClass('open');
            $('#jq-dropdown-decoupe').empty();
            
            //var button = $('<button id="btn-decoupage"  class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Découpage du territoire</button>');
            

            //var button = $('<button id="btn-decoupage" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE14E;</i></button>');
            var button = $('<button id="btn-decoupage" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE14E;</i></button>');
          
            
            var ul = $('<ul />')
                    .addClass('dropdown-menu ' + plugin.settings.decoupeControl.class);
                    //.attr('for', 'btn-decoupage');

            if(plugin.settings.zoneSelect.name == 'departement'){
                button.appendTo($('#jq-dropdown-decoupe'));
                ul.appendTo($('#jq-dropdown-decoupe'));
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'arrondissement').text('Arrondissements').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'pays').text("Pôles d'Equilibre Territorial et Rural").appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'canton').text('Cantons').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'epci').text('Intercommunalités').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'commune').text('Communes').appendTo(ul);
                // on teste si le decoupage initialisé est dans la liste
                if($("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").length > 0)
                    $("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").addClass("selected");
                // sinon on initialise une decoupe par défaut
                else
                    $("#jq-dropdown-decoupe li[data-type='pays']").addClass("selected");
             
                componentHandler.upgradeElement(button.get(0));
                componentHandler.upgradeElement(ul.get(0));
            }
            else if(plugin.settings.zoneSelect.name == 'pays'){
                button.appendTo($('#jq-dropdown-decoupe'));
                ul.appendTo($('#jq-dropdown-decoupe'));
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'epci').text('Intercommunalités').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'commune').text('Communes').appendTo(ul);
                if($("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").length > 0)
                    $("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").addClass("selected");
                else
                    $("#jq-dropdown-decoupe li[data-type='epci']").addClass("selected");
                
                 componentHandler.upgradeElement(button.get(0));
                 componentHandler.upgradeElement(ul.get(0)); 
            }


           
            $('#jq-dropdown-decoupe li').on('click', function(e) {
                 plugin.settings.decoupage = {name:"decoupage",value:$(this).data("type")};
                 var datas = plugin.datas();
                 if(plugin.settings.selectDecoupage)plugin.settings.selectDecoupage(datas);
             });
        }



        // fire up the plugin!
        // call the "constructor" method
        plugin.init();
    
    }   


    // add the plugin to the jQuery.fn object
    $.fn.geometiers = function(options) {
      
        return this.each(function() {
 
            if (undefined == $(this).data('geometiers')) {

                var plugin = new $.geometiers(this, options);
                $(this).data('geometiers', plugin);

            }

        });

    }


})(jQuery);