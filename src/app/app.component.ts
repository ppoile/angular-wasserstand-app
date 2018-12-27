import { Component, Injectable } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { delay } from 'rxjs/internal/operators';
import { Observable, timer, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { MeasurementService } from './measurement.service';

/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    public level: number,
    public type: any,
  ) {}
}

/**
 * The file structure tree data in string. The data could be parsed into a Json object
 */
const TREE_DATA = JSON.stringify({
  Applications: {
    Calendar: 'app',
    Chrome: 'app',
    Webstorm: 'app'
  },
  Documents: {
    angular: {
      src: {
        compiler: 'ts',
        core: 'ts'
      }
    },
    material2: {
      src: {
        button: 'ts',
        checkbox: 'ts',
        input: 'ts'
      }
    }
  },
  Downloads: {
    October: 'pdf',
    November: 'pdf',
    Tutorial: 'html'
  },
  Pictures: {
    'Photo Booth Library': {
      Contents: 'dir',
      Pictures: 'dir'
    },
    Sun: 'png',
    Woods: 'jpg'
  }
});

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class FileDatabase {
  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Parse the string to json object.
    const dataObject = JSON.parse(TREE_DATA);

    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    const data = this.buildFileTree(dataObject, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  buildFileTree(obj: {[key: string]: any}, level: number): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new FileNode();
      node.filename = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.type = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [FileDatabase],
})

export class AppComponent {
  model = {
    "allJobs": [
      "g30", "g30_audiopath","g30_mediastreamer","g30_mobilephones",
      "M18_06_W1", "M18_06_W1_audiopath", "M18_06_W1_mediastreamer", "M18_06_W1_mobilephones",
      "M18_09_W2", "M18_09_W2_audiopath", "M18_09_W2_mediastreamer", "M18_09_W2_mobilephones",
    ],
    "selectedJob": null,
  };
  title = 'wasserstand-app';
  referenceLevel = 438;
  levelWarning: boolean;
  measurement = '(unknown)';
  updateMeasurementTimeoutInMinutes = 5;
  milliSecondsPerMinute = 60 * 1000;
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  ttt;

  constructor(
    private measurementService: MeasurementService,
    private database: FileDatabase
  ) {
    console.log(`measurement: ${this.measurement}`);
    this.setupTimer();
    this.treeFlattener = new MatTreeFlattener(
      this.transformer, this._getLevel, this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => this.dataSource.data = data);
    this.ttt = [];
    console.log("ttt:", this.ttt);
    this.getTestrun(0, 1000).subscribe((data) => {
      this.ttt[0] = data;
      console.log("ttt:", this.ttt);
    });
    this.getTestrun(1, 3000).subscribe((data) => {
      this.ttt[1] = data;
      console.log("ttt:", this.ttt);
    });
    this.getTestrun(2, 2000).subscribe((data) => {
      this.ttt[2] = data;
      console.log("ttt:", this.ttt);
    });
  }

  onGroupChange(event) {
    console.log("event:", event);
    this.model.selectedJob = event.value;
  }

  subscribeMeasurement(): void {
    const observer = {
      next: (measurement) => {
        this.measurement = measurement.toString();
        this.updateLevelWarning();
      },
      error: (err) => console.error('Observer: got an error: ' + err),
      complete: () => console.log('Observer: got complete notification'),
    };
    const observable = this.measurementService.getObservable();
    observable.subscribe(observer);
  }

  updateLevelWarning(): void {
    this.levelWarning = +this.measurement >= this.referenceLevel;
    console.log(`levelWarning: ${this.levelWarning}`);
  }

  setupTimer(): void {
    const timeoutInMilliseconds = this.updateMeasurementTimeoutInMinutes * this.milliSecondsPerMinute;
    const updateTimer = timer(0, timeoutInMilliseconds);
    updateTimer.subscribe(timeoutCounter => {
      console.log(`timeout...(counter=${timeoutCounter})`);
      this.subscribeMeasurement();
    });
  }

  onUpdateMeasurement(): void {
    console.log('update...');
    this.subscribeMeasurement();
  }

  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(!!node.children, node.filename, level, node.type);
  }

  private _getLevel = (node: FileFlatNode) => node.level;

  private _isExpandable = (node: FileFlatNode) => node.expandable;

  private _getChildren = (node: FileNode): Observable<FileNode[]> => of(node.children);

  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  getTestrun(index, delayInMsec) {
    const testruns = [
      {'id': 1, 'testsuites': [
        {'name': 'A', 'testcases': [
          {'name': 'A', 'success': true},
          {'name': 'B', 'success': true},
        ]},
        {'name': 'B', 'testcases': [
          {'name': 'A', 'success': false},
          {'name': 'B', 'success': false},
        ]},
        {'name': 'C', 'testcases': [
          {'name': 'A', 'success': true},
          {'name': 'B', 'success': true},
        ]},
      ]},
      {'id': 2, 'testsuites': [
        {'name': 'A', 'testcases': [
          {'name': 'A', 'success': true},
          {'name': 'B', 'success': false},
        ]},
        {'name': 'B', 'testcases': [
          {'name': 'A', 'success': false},
          {'name': 'B', 'success': true},
        ]},
        {'name': 'C', 'testcases': [
          {'name': 'A', 'success': false},
          {'name': 'B', 'success': false},
        ]},
      ]},
      {'id': 3, 'testsuites': [
        {'name': 'A', 'testcases': [
          {'name': 'A', 'success': false},
          {'name': 'B', 'success': false},
        ]},
        {'name': 'B', 'testcases': [
          {'name': 'A', 'success': true},
          {'name': 'B', 'success': true},
        ]},
        {'name': 'C', 'testcases': [
          {'name': 'A', 'success': true},
          {'name': 'B', 'success': true},
        ]},
      ]},
    ];
    return of(testruns[index]);
  }
}
