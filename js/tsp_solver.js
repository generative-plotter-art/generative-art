// Based on https://raw.githubusercontent.com/dzhang55/travelling-salesman/master/solver.js

var tsp_height = 2;
var tsp_width = 2;
var tsp_path = [];
var tsp_paths = [];
var tsp_points = [];
var tsp_swaps = [];
var tsp_insertions = [];
var tsp_pathDistances = [];
var tsp_distanceMatrix;
var tsp_isAnimate;
var tsp_N;

var tsp_solver = function (points, res) {
    tsp_points = points;
    tsp_N = tsp_points.length;
    tsp_generateDistanceMatrix();
    tsp_isAnimate = false; //req.body.animate;
    tsp_path = [];
    tsp_paths = [];
    tsp_swaps = [];
    tsp_insertions = [];
    tsp_pathDistances = [];
    var isClosed = true;

    tsp_nearestInsertion();
    tsp_iterativeTwoOpt();
    if (tsp_isAnimate) {
        res({
            paths: tsp_paths,
            distances: tsp_pathDistances,
            swaps: tsp_swaps,
            insertions: tsp_insertions,
            isClosed: isClosed
        });
    } else {
        res({
            paths: tsp_paths,
            distances: tsp_pathDistances,
            swaps: [],
            insertions: [],
            isClosed: isClosed
        });
    }
}

// store distances from each point to every other point
var tsp_generateDistanceMatrix = function () {
    tsp_distanceMatrix = new Array(tsp_N);
    for (var i = 0; i < tsp_N; i++) {
        tsp_distanceMatrix[i] = new Array(tsp_N);
    }

    for (var i = 0; i < tsp_N; i++) {
        for (var j = i; j < tsp_N; j++) {
            tsp_distanceMatrix[i][j] = Math.sqrt((tsp_points[i].x - tsp_points[j].x) * (tsp_points[i].x
                 - tsp_points[j].x) + (tsp_points[i].y - tsp_points[j].y) * (tsp_points[i].y - tsp_points[j].y));
            tsp_distanceMatrix[j][i] = tsp_distanceMatrix[i][j];
        }
    }
};

var tsp_getPathDistance = function (path) {
    var d = tsp_distanceMatrix[path[0]][path[path.length - 1]];
    for (var i = 1; i < path.length; i++) {
        d += tsp_distanceMatrix[path[i - 1]][path[i]];
    }
    return d;
};


// inorder tour
var tsp_inOrder = function () {
    tsp_path = tsp_generateRandomPath();
    tsp_pathDistances.push(tsp_getPathDistance(tsp_path));
    tsp_paths.push(tsp_path);
};

var tsp_generateRandomPath = function () {
    var tsp_path = [];
    for (var i = 0; i < tsp_N; i++) {
        tsp_path[i] = i;
    }
//    path = tsp_shuffle(path);
    return tsp_path;
};


// tour of points using nearest neighbor heuristic
var tsp_nearestNeighbor = function() {
    var remaining = tsp_generateRandomPath();
    tsp_path = [remaining[0]];
    tsp_paths.push(tsp_path.slice(0));

    for (var i = 0; i < tsp_points.length - 1; i++) {
        var nearestDistance = tsp_height * tsp_height + tsp_width * tsp_width + 1;
        var nearestPoint = null;
        var indexInRemaining = 0;

        // find nearest neighbor
        for (var j = i + 1; j < points.length; j++) {
            tsp_currentDistance = tsp_distanceMatrix[tsp_path[i]][remaining[j]];
            if (tsp_currentDistance < nearestDistance) {
                nearestPoint = remaining[j];
                nearestDistance = currentDistance;
                indexInRemaining = j;
            }
        }
        // add to path and swap in remaining so it will not be added again
        remaining = tsp_swap(remaining, i + 1, indexInRemaining);
        tsp_path.push(remaining[i + 1]);
        if (isAnimate) {
            tsp_paths.push(tsp_path.slice(0));
            tsp_insertions.push({
                i: i + 1,
                before: points[remaining[i]],
                insert: points[remaining[i + 1]],
                after: null
            });
        }
    }
    if (!isAnimate) {
        tsp_paths = [tsp_path];
    }
    tsp_pathDistances.push(tsp_getPathDistance(tsp_path));
};

var tsp_swap = function (path, i, j) {
    var clone = path.slice(0);
    var temp = clone[i];
    clone[i] = clone[j];
    clone[j] = temp;
    return clone;
};

// tour of points using either nearest or farthest insertion heuristic
var tsp_nearestInsertion = function () {
    // create initial single point subtour
    var remaining = tsp_generateRandomPath();
    tsp_path = [remaining[0]];
    tsp_paths.push(tsp_path.slice(0));

    for (var i = 1; i < tsp_points.length; i++) {
        var indexInRemaining = 0;
        var indexInPath = 0;
        var minimalDistance = tsp_height * tsp_height + tsp_width * tsp_width + 1;
        var maximalDistanceToTour = -1;
        var bestPoint = null;

        for (var j = i; j < tsp_points.length; j++) {
            for (var k = 0; k < tsp_path.length; k++) {
                var currentDistance = tsp_distanceMatrix[tsp_path[k]][remaining[j]];

                // find minimal distance from j to a point in the subtour
                if (currentDistance < minimalDistance) {
                    minimalDistance = currentDistance;

                    // for nearest insertion store the closest point
                    bestPoint = remaining[j];
                    indexInRemaining = j;
                }
            }
        }

        remaining = tsp_swap(remaining, indexInRemaining, i);

        // look for the edge in the subtour where insertion would be least costly
        var smallestDetour = tsp_height * tsp_height + tsp_width * tsp_width + 1;
        for (var k = 0; k < tsp_path.length - 1; k++) {
            var currentDetour = tsp_detour(tsp_path[k], remaining[i], tsp_path[k + 1]);
            if (currentDetour < smallestDetour) {
                smallestDetour = currentDetour;
                indexInPath = k;
            }
        }
        // check the detour between last point and first
        if (tsp_detour(tsp_path[tsp_path.length - 1], remaining[i], tsp_path[0]) < smallestDetour) {
            tsp_insertions.push({
                i: i,
                before: tsp_points[tsp_path[tsp_path.length - 1]],
                insert: tsp_points[remaining[i]],
                after: tsp_points[tsp_path[0]]
            });
            tsp_path.splice(tsp_path.length, 0, remaining[i]);
        } else {
            tsp_insertions.push({
                i: i,
                before: tsp_points[tsp_path[indexInPath]],
                insert: tsp_points[remaining[i]],
                after: tsp_points[tsp_path[indexInPath + 1]]
            });
            tsp_path.splice(indexInPath + 1, 0, remaining[i]);
        }
        if (tsp_isAnimate) {
            tsp_paths.push(tsp_path.slice(0));
        }
    }
    if (!tsp_isAnimate) {
        tsp_paths = [tsp_path];
    }
    tsp_pathDistances.push(tsp_getPathDistance(tsp_path));
};

var tsp_detour = function (before, insert, after) {
    return tsp_distanceMatrix[before][insert] + tsp_distanceMatrix[insert][after] - tsp_distanceMatrix[before][after];
};

var tsp_hillClimber = function (step, numSteps) {
    return 0;
};

var tsp_linearSA = function (startTemp, step, numSteps) {
    return (1 - step / numSteps) * startTemp;
};

var tsp_exponentialSA = function (startTemp, step, numSteps) {
    //end temp around 1 because ln startTemp is approx 5
    return startTemp * Math.exp((0.0 - step) / numSteps * 5);
};

// randomized heuristic using cooling function to determine if inferior steps should be accepted
var tsp_simulatedAnnealing = function (coolingFunction, steps) {
    if (!tsp_path.length) {
        tsp_path = tsp_generateRandomPath();
    }
    var startTemp = N / 2;
    var endTemp = 1;
    var currPathDistance = tsp_getPathDistance(tsp_path);

    var numSwaps = 0;
    tsp_paths.push(tsp_path.slice(0));

    for (var step = 0; step < steps; step++) {
        var temp = tsp_coolingFunction(startTemp, step, steps);
        var i = Math.floor(tsp_path.length * Math.random());
        var j = Math.floor(tsp_path.length * Math.random());
        var first = Math.min(i, j);
        var second = Math.max(i, j);

        if (first == tsp_path.length - 1) {
            first = Math.floor((tsp_path.length - 1) * Math.random());
        }

        // check edge from last point to first
        var afterSecond = second == tsp_path.length - 1 ? 0 : second + 1;

        var changeInDistance = distanceMatrix[tsp_path[first]][tsp_path[second]]
            + distanceMatrix[tsp_path[afterSecond]][tsp_path[first + 1]]
            - distanceMatrix[tsp_path[first]][tsp_path[first + 1]]
            - distanceMatrix[tsp_path[second]][tsp_path[afterSecond]];

        // always accept step if it is superior, accept with some chance if it is inferior
        if (changeInDistance < 0 || Math.random() <= Math.exp((0 - changeInDistance) / temp)) {
            numSwaps += 1;
            swaps.push({
                i: step,
                firstEdge0: points[tsp_path[first]],
                firstEdge1: points[tsp_path[first + 1]],
                secondEdge0: points[tsp_path[second]],
                secondEdge1: points[tsp_path[afterSecond]]
            });
            tsp_path = tsp_swapEdges(tsp_path, first, second);
            tsp_paths.push(tsp_path.slice(0));
            currPathDistance = tsp_getPathDistance(tsp_path);
            tsp_pathDistances.push(tsp_currPathDistance);
        }
    }
    if (!isAnimate) {
        tsp_paths = [tsp_path];
    }
};

var tsp_genetic = function (generations, popSize) {
    var parentPaths = [];
    var childrenPaths = [];
    //var popSize = 1000;
    //var generations = 1000;
    var mutationChance = 0.08;
    var bestDistanceSoFar = Number.MAX_VALUE;
    var bestPath = tsp_points;

    for (var i = 0; i < popSize; i++) {
        parentPaths[i] = tsp_generateRandomPath();
    }

    for (var i = 0; i < generations; i++) {
        childrenPaths = [];
        for (var j = 0; j < popSize; j++) {
            var firstParent = tsp_tournamentSelect(parentPaths);
            var secondParent = tsp_tournamentSelect(parentPaths);
            var child = tsp_orderCrossover(parentPaths[firstParent], parentPaths[secondParent]);

            if (Math.random() < mutationChance) {
                child = tsp_mutation(child);
            }
            childrenPaths.push(child);
            var childFitness = tsp_getPathDistance(child);
            if (childFitness < bestDistanceSoFar) {
                bestDistanceSoFar = childFitness;
                bestPath = child;
                //if (isAnimate) {
                //    paths.push(bestPath.slice(0));
                //}
            }
        }
        tsp_pathDistances.push(bestDistanceSoFar);
        parentPaths.length = 0;
        parentPaths = childrenPaths;
    }
    tsp_paths = [bestPath.slice(0)];
};

var tsp_shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

// pick the fittest out of a sample (aka tournament)
var tsp_tournamentSelect = function (paths) {
    var tournamentSize = 8;
    var fittest = -1;
    var bestDistance = Number.MAX_VALUE;
    for (var i = 0; i < tournamentSize; i++) {
        var randomIndex = Math.floor(paths.length * Math.random());
        var fitness = getPathDistance(paths[randomIndex]);
        if (fitness < bestDistance) {
            bestDistance = fitness;
            fittest = randomIndex;
        }
    }
    return fittest;
};

// crossover between two paths by keeping a subset of the first parent
// and maintaining the order of the second parent for the remaining points
var tsp_orderCrossover = function (firstPath, secondPath) {
    var firstChild = [];

    var i = Math.floor(firstPath.length * Math.random());
    var j = Math.floor(firstPath.length * Math.random());
    var first = Math.min(i, j);
    var second = Math.max(i, j);

    for (var i = first; i <= second; i++) {
        firstChild[i] = firstPath[i];
    }

    var indexInSecond = 0;
    for (var i = 0; i < firstPath.length; i++) {
        if (i >= first && i <= second) {
            continue;
        }
        // omit points already added
        while (contains(firstChild, secondPath[indexInSecond], first, second)) {
            indexInSecond++;
        }
        firstChild[i] = secondPath[indexInSecond];
        indexInSecond++;
    }
    return firstChild;
};

var tsp_mutation = function (child) {
    var i = Math.floor(child.length * Math.random());
    var j = Math.floor(child.length * Math.random());
    var first = Math.min(i, j);
    var second = Math.max(i, j);

    if (first == child.length - 1) {
        first = Math.floor((child.length - 1) * Math.random());
    }

    // check edge from last point to first
    var afterSecond = second == child.length - 1 ? 0 : second + 1;

    var changeInDistance = distanceMatrix[child[first]][child[second]]
        + distanceMatrix[child[afterSecond]][child[first + 1]]
        - distanceMatrix[child[first]][child[first + 1]]
        + distanceMatrix[child[second]][child[afterSecond]];

    child = swapEdges(child, first, second);

    return child;
};

var tsp_contains = function (childPath, point, begin, end) {
    for (var i = begin; i <= end; i++) {
        if (childPath[i] == point) {
            return true;
        }
    }
    return false;
};

// performs two opt swaps iteratively until no more advantageous swaps are found
var tsp_iterativeTwoOpt = function () {
    var bestDistance = 0;
    var count = 0
    while (bestDistance != tsp_twoOpt(count)) {
        bestDistance = tsp_getPathDistance(tsp_path);
        tsp_pathDistances.push(bestDistance);
        count += 1;
    }
    if (!tsp_isAnimate) {
    	tsp_paths = [tsp_path];
    }
};

var tsp_twoOpt = function (count) {
    for (var i = 0; i < tsp_path.length - 2; i++) {
        for (var j = i + 2; j < tsp_path.length - 1; j++) {
            if (tsp_distanceMatrix[tsp_path[i]][tsp_path[i + 1]] + tsp_distanceMatrix[tsp_path[j]][tsp_path[j + 1]]
                > tsp_distanceMatrix[tsp_path[i]][tsp_path[j]] + tsp_distanceMatrix[tsp_path[j + 1]][tsp_path[i + 1]]) {

                tsp_swaps.push({
                    i: count,
                    firstEdge0: tsp_points[tsp_path[i]],
                    firstEdge1: tsp_points[tsp_path[i + 1]],
                    secondEdge0: tsp_points[tsp_path[j]],
                    secondEdge1: tsp_points[tsp_path[j + 1]]
                });

                tsp_path = tsp_swapEdges(tsp_path, i, j);
                tsp_paths.push(tsp_path);
                return tsp_getPathDistance(tsp_path);
            }
        }
        // check the edge from last point to first point
        if (tsp_distanceMatrix[tsp_path[i]][tsp_path[i + 1]] + tsp_distanceMatrix[tsp_path[j]][tsp_path[0]]
            > tsp_distanceMatrix[tsp_path[i]][tsp_path[j]] + tsp_distanceMatrix[tsp_path[0]][tsp_path[i + 1]]) {

            tsp_swaps.push({
                i: count,
                firstEdge0: tsp_points[tsp_path[i]],
                firstEdge1: tsp_points[tsp_path[i + 1]],
                secondEdge0: tsp_points[tsp_path[j]],
                secondEdge1: tsp_points[tsp_path[0]]
            });

            tsp_path = tsp_swapEdges(tsp_path, i, j);
            tsp_paths.push(tsp_path);
            return tsp_getPathDistance(tsp_path);
        }
    }
    return tsp_getPathDistance(tsp_path);
};

var tsp_swapEdges = function (path, first, second) {
    return path.slice(0, first + 1).concat(path.slice(first + 1, second + 1)
        .reverse().concat(path.slice(second + 1)));
};
